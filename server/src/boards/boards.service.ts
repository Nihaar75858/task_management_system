import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateBoardDto } from "./dto/update-board.dto";

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForProject(projectId: string, userId: string) {
    await this.assertProjectOwnership(projectId, userId);

    return this.prisma.board.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOneForUser(boardId: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, project: { ownerId: userId } },
      include: {
        columns: { orderBy: { order: "asc" } },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    return board;
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    await this.assertBoardOwnership(boardId, userId);

    return this.prisma.board.update({
      where: { id: boardId },
      data: { name: dto.name },
    });
  }

  private async assertProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
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
}
