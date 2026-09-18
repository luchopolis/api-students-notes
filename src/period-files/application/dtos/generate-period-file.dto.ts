import { IsUUID } from 'class-validator';

export class GeneratePeriodFileDto {
  @IsUUID()
  readonly periodId!: string;

  @IsUUID()
  readonly subjectId!: string;
}
