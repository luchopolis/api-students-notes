import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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

  @IsDateString()
  readonly birthDate!: string;

  @IsEmail()
  readonly email!: string;
}
