import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { GENDERS, type Gender } from '../../domain/entities/student.entity.js';

// Campos obligatorios: se pueden omitir, pero no dejar en `null` ni vacíos.
// Campos opcionales: `null` los borra (`@IsOptional` deja pasar `null` y `undefined`).
export class UpdateStudentDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  readonly dni?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  readonly firstName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  readonly lastName1?: string;

  @IsOptional()
  @IsString()
  readonly lastName2?: string | null;

  @IsOptional()
  @IsIn(GENDERS)
  readonly gender?: Gender | null;

  @IsOptional()
  @IsDateString()
  readonly birthDate?: string | null;

  @IsOptional()
  @IsEmail()
  readonly email?: string | null;
}
