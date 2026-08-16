import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const DEFAULT_COLUMNS = [
  { name: 'To Do', order: 0, colorKey: 'neutral' },
  { name: 'Doing', order: 1, colorKey: 'blue' },
  { name: 'Completed', order: 2, colorKey: 'emerald' },
  { name: 'On Hold', order: 3, colorKey: 'orange' },
];

const projectListInclude = {
  boards: { select: { id: true, name: true } },
  lead: {
    select: { id: true, name: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      include: projectListInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId: userId },
      include: projectListInclude,
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
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        ownerId: userId,
        boards: {
          create: {
            name: 'Tasks',
            columns: { create: DEFAULT_COLUMNS },
          },
        },
      },
      include: projectListInclude,
    });
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.assertOwnership(id, userId);

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: projectListInclude,
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
