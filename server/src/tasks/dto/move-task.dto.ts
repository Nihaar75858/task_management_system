import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class MoveTaskDto {
  /** The column the task is being moved into (same as its current column for a pure reorder). */
  @IsUUID()
  columnId: string;

  /**
   * The full ordered list of task ids in the destination column *after*
   * the move, including the moved task itself. Position is derived from
   * array index — the frontend computes this locally after a drag-and-drop
   * and just sends the resulting order.
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  orderedTaskIds: string[];
}
