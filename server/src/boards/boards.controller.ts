import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { RequestUser } from '../types/jwt-payload.type';
import { BoardsService } from './boards.service';
import { UpdateBoardDto } from './dto/update-board.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('projects/:projectId/boards')
  findAllForProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.boardsService.findAllForProject(projectId, user.id);
  }

  @Get('boards/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.boardsService.findOneForUser(id, user.id);
  }

  @Patch('boards/:id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.boardsService.update(id, user.id, updateBoardDto);
  }
}
