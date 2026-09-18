import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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
  @IsDateString()
  readonly birthDate?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
