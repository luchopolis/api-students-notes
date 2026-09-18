import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { GENDERS, type Gender } from '../../domain/entities/student.entity.js';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly dni?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly lastName1?: string;

  @IsOptional()
  @IsString()
  readonly lastName2?: string;

  @IsOptional()
  @IsIn(GENDERS)
  readonly gender?: Gender;

  @IsOptional()
  @IsDateString()
  readonly birthDate?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
