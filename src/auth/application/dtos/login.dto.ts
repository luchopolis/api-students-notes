import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  readonly email!: string;

  // El tope evita que scrypt procese cuerpos gigantes.
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  readonly password!: string;
}
