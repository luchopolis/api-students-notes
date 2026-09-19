import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

// Llega como multipart/form-data: todos los campos son texto, incluido `dryRun`.
export class ImportStudentsDto {
  @IsUUID()
  readonly subjectId!: string;

  @IsUUID()
  readonly academicYearId!: string;

  /** Si es `true` solo se revisa el archivo y se informa qué pasaría, sin guardar nada. */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  readonly dryRun?: boolean;
}
