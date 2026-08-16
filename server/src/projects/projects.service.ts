import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        boards: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId: userId },
      include: {
        boards: { select: { id: true, name: true } },
      },
    });

    // 404, not 403, on a project that exists but isn't owned by this user —
    // doesn't leak whether the id exists at all to a non-owner.
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    return project;
  }

  create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        ownerId: userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.assertOwnership(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);
    await this.prisma.project.delete({ where: { id } });
  }

  private async assertOwnership(id: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId: userId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}
