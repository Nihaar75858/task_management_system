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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { RequestUser } from '../types/jwt-payload.type';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignMembersDto } from './dto/assign-members.dto';
import { AssignLabelsDto } from './dto/assign-labels.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('boards/:boardId/tasks')
  findAllForBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: RequestUser,
    @Query('search') search?: string,
  ) {
    return this.tasksService.findAllForBoard(boardId, user.id, search);
  }

  @Post('columns/:columnId/tasks')
  create(
    @Param('columnId') columnId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.create(columnId, user.id, createTaskDto);
  }

  @Get('tasks/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.findOneForUser(id, user.id);
  }

  @Patch('tasks/:id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.update(id, user.id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.remove(id, user.id);
  }

  @Post('tasks/:id/move')
  move(
    @Param('id') id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.move(id, user.id, moveTaskDto);
  }

  @Put('tasks/:id/assignees')
  assignMembers(
    @Param('id') id: string,
    @Body() assignMembersDto: AssignMembersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.assignMembers(id, user.id, assignMembersDto);
  }

  @Put('tasks/:id/labels')
  assignLabels(
    @Param('id') id: string,
    @Body() assignLabelsDto: AssignLabelsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.assignLabels(id, user.id, assignLabelsDto);
  }
}
