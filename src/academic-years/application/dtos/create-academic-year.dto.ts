import { IsDateString, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateAcademicYearDto {
  @IsString()
  @MinLength(1)
  readonly yearName!: string;

  @IsDateString()
  readonly startDate!: string;

  @IsDateString()
  readonly endDate!: string;

  @IsUUID()
  readonly teacherId!: string;
}
