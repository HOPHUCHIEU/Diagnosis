import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator'

export class CreateAppointmentPackageDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsNumber()
  @Min(1)
  appointmentCount: number

  @IsNumber()
  @Min(0)
  price: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsNumber()
  @IsOptional()
  validityPeriod?: number // Thời hạn hiệu lực tính bằng ngày

  @IsArray()
  @IsOptional()
  features?: string[]
}
