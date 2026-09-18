import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateEvaluationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly weight?: number;
}
