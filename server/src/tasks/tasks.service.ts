import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignMembersDto } from './dto/assign-members.dto';
import { AssignLabelsDto } from './dto/assign-labels.dto';

const taskInclude = {
  assignees: {
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  },
  labels: { include: { label: true } },
  reporter: { select: { id: true, name: true, avatarUrl: true } },
  column: {
    select: {
      id: true,
      boardId: true,
      board: { select: { projectId: true } },
    },
  },
} as const;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findAllForBoard(boardId: string, userId: string, search?: string) {
    await this.assertBoardOwnership(boardId, userId);

    return this.prisma.task.findMany({
      where: {
        column: { boardId },
        ...(search
          ? { title: { contains: search, mode: 'insensitive' as const } }
          : {}),
      },
      include: taskInclude,
      orderBy: { position: 'asc' },
    });
  }

  async findOneForUser(taskId: string, userId: string) {
    return this.getOwnedTaskOrThrow(taskId, userId);
  }

  async create(columnId: string, userId: string, dto: CreateTaskDto) {
    const column = await this.getOwnedColumnOrThrow(columnId, userId);

    if (dto.assigneeIds?.length) {
      await this.assertUsersExist(dto.assigneeIds);
    }
    if (dto.labelIds?.length) {
      await this.assertLabelsBelongToProject(
        dto.labelIds,
        column.board.projectId,
      );
    }

    const position = await this.prisma.task.count({ where: { columnId } });

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status ?? 'NOT_STARTED',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        reporterId: dto.reporterId ?? userId,
        columnId,
        position,
        assignees: dto.assigneeIds?.length
          ? { create: dto.assigneeIds.map((id) => ({ userId: id })) }
          : undefined,
        labels: dto.labelIds?.length
          ? { create: dto.labelIds.map((id) => ({ labelId: id })) }
          : undefined,
      },
      include: taskInclude,
    });

    this.realtimeGateway.emitToBoard(column.boardId, 'task:created', task);
    return task;
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const existing = await this.getOwnedTaskOrThrow(taskId, userId);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        reporterId: dto.reporterId,
      },
      include: taskInclude,
    });

    this.realtimeGateway.emitToBoard(
      existing.column.boardId,
      'task:updated',
      updated,
    );
    return updated;
  }

  async remove(taskId: string, userId: string): Promise<void> {
    const task = await this.getOwnedTaskOrThrow(taskId, userId);
    await this.prisma.task.delete({ where: { id: taskId } });

    this.realtimeGateway.emitToBoard(task.column.boardId, 'task:deleted', {
      id: taskId,
      boardId: task.column.boardId,
    });
  }

  /**
   * Persists a drag-and-drop reorder/move. The client computes the new
   * order locally and sends the full resulting id list for the
   * destination column — position is just that list's index, so no
   * increment/decrement juggling is needed server-side.
   */
  async move(taskId: string, userId: string, dto: MoveTaskDto) {
    const task = await this.getOwnedTaskOrThrow(taskId, userId);
    const targetColumn = await this.getOwnedColumnOrThrow(dto.columnId, userId);

    if (!dto.orderedTaskIds.includes(taskId)) {
      throw new BadRequestException(
        'orderedTaskIds must include the task being moved',
      );
    }

    const owned = await this.prisma.task.findMany({
      where: {
        id: { in: dto.orderedTaskIds },
        column: { board: { project: { ownerId: userId } } },
      },
      select: { id: true },
    });
    if (owned.length !== dto.orderedTaskIds.length) {
      throw new NotFoundException(
        'One or more tasks in orderedTaskIds were not found',
      );
    }

    await this.prisma.$transaction(
      dto.orderedTaskIds.map((id, index) =>
        this.prisma.task.update({
          where: { id },
          data: {
            position: index,
            ...(id === taskId ? { columnId: dto.columnId } : {}),
          },
        }),
      ),
    );

    const updated = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: taskInclude,
    });

    const sourceBoardId = task.column.boardId;
    const destinationBoardId = targetColumn.boardId;

    this.realtimeGateway.emitToBoard(destinationBoardId, 'task:moved', updated);
    if (sourceBoardId !== destinationBoardId) {
      this.realtimeGateway.emitToBoard(sourceBoardId, 'task:moved', updated);
    }

    return updated;
  }

  async assignMembers(taskId: string, userId: string, dto: AssignMembersDto) {
    const task = await this.getOwnedTaskOrThrow(taskId, userId);

    if (dto.userIds.length) {
      await this.assertUsersExist(dto.userIds);
    }

    await this.prisma.$transaction([
      this.prisma.taskAssignee.deleteMany({ where: { taskId } }),
      ...(dto.userIds.length
        ? [
            this.prisma.taskAssignee.createMany({
              data: dto.userIds.map((id) => ({ taskId, userId: id })),
            }),
          ]
        : []),
    ]);

    const updated = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: taskInclude,
    });
    this.realtimeGateway.emitToBoard(
      task.column.boardId,
      'task:assigneesChanged',
      updated,
    );
    return updated;
  }

  async assignLabels(taskId: string, userId: string, dto: AssignLabelsDto) {
    const task = await this.getOwnedTaskOrThrow(taskId, userId);

    if (dto.labelIds.length) {
      await this.assertLabelsBelongToProject(
        dto.labelIds,
        task.column.board.projectId,
      );
    }

    await this.prisma.$transaction([
      this.prisma.taskLabel.deleteMany({ where: { taskId } }),
      ...(dto.labelIds.length
        ? [
            this.prisma.taskLabel.createMany({
              data: dto.labelIds.map((id) => ({ taskId, labelId: id })),
            }),
          ]
        : []),
    ]);

    const updated = await this.prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      include: taskInclude,
    });
    this.realtimeGateway.emitToBoard(
      task.column.boardId,
      'task:labelsChanged',
      updated,
    );
    return updated;
  }

  private async getOwnedTaskOrThrow(taskId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        column: { board: { project: { ownerId: userId } } },
      },
      include: taskInclude,
    });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    return task;
  }

  private async getOwnedColumnOrThrow(columnId: string, userId: string) {
    const column = await this.prisma.column.findFirst({
      where: { id: columnId, board: { project: { ownerId: userId } } },
      select: {
        id: true,
        boardId: true,
        board: { select: { projectId: true } },
      },
    });
    if (!column) {
      throw new NotFoundException(`Column ${columnId} not found`);
    }
    return column;
  }

  private async assertBoardOwnership(
    boardId: string,
    userId: string,
  ): Promise<void> {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, project: { ownerId: userId } },
      select: { id: true },
    });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }
  }

  private async assertUsersExist(userIds: string[]): Promise<void> {
    const count = await this.prisma.user.count({
      where: { id: { in: userIds } },
    });
    if (count !== userIds.length) {
      throw new BadRequestException('One or more userIds do not exist');
    }
  }

  private async assertLabelsBelongToProject(
    labelIds: string[],
    projectId: string,
  ): Promise<void> {
    const count = await this.prisma.label.count({
      where: { id: { in: labelIds }, projectId },
    });
    if (count !== labelIds.length) {
      throw new BadRequestException(
        'One or more labelIds do not exist in this project',
      );
    }
  }
}
