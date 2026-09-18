import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(1)
  readonly name!: string;

  @IsEmail()
  readonly email!: string;
}
