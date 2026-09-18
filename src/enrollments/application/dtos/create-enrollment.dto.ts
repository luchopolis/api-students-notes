import { IsDateString, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  readonly studentId!: string;

  @IsUUID()
  readonly subjectId!: string;

  @IsUUID()
  readonly academicYearId!: string;

  @IsDateString()
  readonly registrationDate!: string;
}
