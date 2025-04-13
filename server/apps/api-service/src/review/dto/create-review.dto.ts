import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  appointmentId: string

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number

  @IsString()
  @IsNotEmpty()
  comment: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[]
}
