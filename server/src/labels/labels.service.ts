import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForProject(projectId: string, userId: string) {
    await this.assertProjectOwnership(projectId, userId);

    return this.prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });
  }

  async create(projectId: string, userId: string, dto: CreateLabelDto) {
    await this.assertProjectOwnership(projectId, userId);

    return this.prisma.label.create({
      data: { name: dto.name, color: dto.color, projectId },
    });
  }

  async update(labelId: string, userId: string, dto: UpdateLabelDto) {
    await this.assertLabelOwnership(labelId, userId);

    return this.prisma.label.update({
      where: { id: labelId },
      data: { name: dto.name, color: dto.color },
    });
  }

  async remove(labelId: string, userId: string): Promise<void> {
    await this.assertLabelOwnership(labelId, userId);
    await this.prisma.label.delete({ where: { id: labelId } });
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

  private async assertLabelOwnership(
    labelId: string,
    userId: string,
  ): Promise<void> {
    const label = await this.prisma.label.findFirst({
      where: { id: labelId, project: { ownerId: userId } },
      select: { id: true },
    });
    if (!label) {
      throw new NotFoundException(`Label ${labelId} not found`);
    }
  }
}
