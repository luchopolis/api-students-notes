import { IsNumber, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateActivityDto {
  @IsUUID()
  readonly subjectId!: string;

  @IsString()
  @MinLength(1)
  readonly name!: string;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  readonly weight!: number;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
