import { IsArray, IsUUID } from 'class-validator';

export class AssignLabelsDto {
  /** Full replacement list — send [] to clear all labels. */
  @IsArray()
  @IsUUID(undefined, { each: true })
  labelIds: string[];
}
