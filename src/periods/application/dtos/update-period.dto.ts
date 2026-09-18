import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePeriodDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly name?: string;
}
