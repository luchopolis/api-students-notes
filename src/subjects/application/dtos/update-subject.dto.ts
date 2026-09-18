import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
