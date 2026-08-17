import { IsArray, IsUUID } from 'class-validator';

export class AssignMembersDto {
  /** Full replacement list — send [] to clear all assignees. */
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds: string[];
}
