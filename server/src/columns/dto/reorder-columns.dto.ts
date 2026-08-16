import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class ColumnOrderItem {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderColumnsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderItem)
  columns: ColumnOrderItem[];
}
