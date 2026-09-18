import { IsOptional, IsUUID } from 'class-validator';

export class FindPeriodFilesQueryDto {
  @IsOptional()
  @IsUUID()
  readonly periodId?: string;

  @IsOptional()
  @IsUUID()
  readonly subjectId?: string;
}
