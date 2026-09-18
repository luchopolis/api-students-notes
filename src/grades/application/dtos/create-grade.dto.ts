import { IsDateString, IsEnum, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { GRADE_STATUSES, type GradeStatus } from '../../domain/entities/grade.entity.js';

export class CreateGradeDto {
  @IsUUID()
  readonly enrollmentId!: string;

  @IsOptional()
  @IsUUID()
  readonly activityId?: string;

  @IsOptional()
  @IsUUID()
  readonly subActivityId?: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  readonly gradeValue!: number;

  @IsOptional()
  @IsDateString()
  readonly submissionDate?: string;

  @IsOptional()
  @IsEnum(GRADE_STATUSES)
  readonly status?: GradeStatus;
}
