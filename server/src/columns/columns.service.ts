import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForBoard(boardId: string, userId: string) {
    await this.assertBoardOwnership(boardId, userId);

    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
  }

  async update(columnId: string, userId: string, dto: UpdateColumnDto) {
    await this.assertColumnOwnership(columnId, userId);

    return this.prisma.column.update({
      where: { id: columnId },
      data: { name: dto.name, colorKey: dto.colorKey },
    });
  }

  /**
   * Bulk-updates column order within a single board, e.g. after a
   * drag-and-drop reorder on the frontend. Each column id is verified to
   * actually belong to the target board before writing, so a request can't
   * be used to move a column into (or reorder within) a board the caller
   * doesn't own or that the column isn't even part of.
   */
  async reorder(
    boardId: string,
    userId: string,
    dto: ReorderColumnsDto,
  ): Promise<void> {
    await this.assertBoardOwnership(boardId, userId);

    const columnIds = dto.columns.map((c) => c.id);
    const existing = await this.prisma.column.findMany({
      where: { id: { in: columnIds }, boardId },
      select: { id: true },
    });

    if (existing.length !== columnIds.length) {
      throw new NotFoundException(
        'One or more columns do not belong to this board',
      );
    }

    await this.prisma.$transaction(
      dto.columns.map((c) =>
        this.prisma.column.update({
          where: { id: c.id },
          data: { order: c.order },
        }),
      ),
    );
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

  private async assertColumnOwnership(
    columnId: string,
    userId: string,
  ): Promise<void> {
    const column = await this.prisma.column.findFirst({
      where: { id: columnId, board: { project: { ownerId: userId } } },
      select: { id: true },
    });
    if (!column) {
      throw new NotFoundException(`Column ${columnId} not found`);
    }
  }
}
