import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { GENDERS, type Gender } from '../../domain/entities/student.entity.js';

export class CreateStudentDto {
  @IsString()
  @MinLength(1)
  readonly dni!: string;

  @IsString()
  @MinLength(1)
  readonly firstName!: string;

  @IsString()
  @MinLength(1)
  readonly lastName1!: string;

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
