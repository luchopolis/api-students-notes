import { IsOptional, IsUUID } from 'class-validator';

export class FindEnrollmentsQueryDto {
  @IsOptional()
  @IsUUID()
  readonly subjectId?: string;

  @IsOptional()
  @IsUUID()
  readonly academicYearId?: string;
}
