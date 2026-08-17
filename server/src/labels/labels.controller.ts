import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { RequestUser } from '../types/jwt-payload.type';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get('projects/:projectId/labels')
  findAllForProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.labelsService.findAllForProject(projectId, user.id);
  }

  @Post('projects/:projectId/labels')
  create(
    @Param('projectId') projectId: string,
    @Body() createLabelDto: CreateLabelDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.labelsService.create(projectId, user.id, createLabelDto);
  }

  @Patch('labels/:id')
  update(
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.labelsService.update(id, user.id, updateLabelDto);
  }

  @Delete('labels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.labelsService.remove(id, user.id);
  }
}
