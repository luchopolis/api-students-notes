import { IsOptional, IsUUID } from 'class-validator';

export class FindActivitiesQueryDto {
  @IsOptional()
  @IsUUID()
  readonly subjectId?: string;
}
