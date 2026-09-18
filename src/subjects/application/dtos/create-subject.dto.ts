import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @MinLength(1)
  readonly code!: string;

  @IsString()
  @MinLength(1)
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
