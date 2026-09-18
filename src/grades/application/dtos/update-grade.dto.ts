import { IsDateString, IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { GRADE_STATUSES, type GradeStatus } from '../../domain/entities/grade.entity.js';

export class UpdateGradeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  readonly gradeValue?: number;

  @IsOptional()
  @IsDateString()
  readonly submissionDate?: string;

  @IsOptional()
  @IsEnum(GRADE_STATUSES)
  readonly status?: GradeStatus;
}
