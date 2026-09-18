import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreatePeriodDto {
  @IsInt()
  @Min(1)
  @Max(4)
  readonly number!: number;

  @IsString()
  @MinLength(1)
  readonly name!: string;
}
