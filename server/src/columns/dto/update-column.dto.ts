import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  colorKey?: string;
}
