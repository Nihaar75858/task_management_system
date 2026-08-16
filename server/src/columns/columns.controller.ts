import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { RequestUser } from '../types/jwt-payload.type';
import { ColumnsService } from './columns.service';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get('boards/:boardId/columns')
  findAllForBoard(
    @Param('boardId') boardId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.columnsService.findAllForBoard(boardId, user.id);
  }

  @Patch('boards/:boardId/columns/reorder')
  reorder(
    @Param('boardId') boardId: string,
    @Body() reorderColumnsDto: ReorderColumnsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.columnsService.reorder(boardId, user.id, reorderColumnsDto);
  }

  @Patch('columns/:id')
  update(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.columnsService.update(id, user.id, updateColumnDto);
  }
}
