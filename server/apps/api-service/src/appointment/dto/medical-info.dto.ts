import { IsArray, IsOptional, IsString } from 'class-validator'

export class MedicalInfoDto {
  @IsString()
  @IsOptional()
  symptoms?: string

  @IsString()
  @IsOptional()
  reason?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications?: string[]

  @IsString()
  @IsOptional()
  notes?: string
}
