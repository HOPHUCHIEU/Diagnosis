import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class DailyScheduleDto {
  @IsBoolean()
  @IsOptional()
  morning?: boolean = false

  @IsString()
  @IsOptional()
  morningStart?: string

  @IsString()
  @IsOptional()
  morningEnd?: string

  @IsBoolean()
  @IsOptional()
  afternoon?: boolean = false

  @IsString()
  @IsOptional()
  afternoonStart?: string

  @IsString()
  @IsOptional()
  afternoonEnd?: string

  @IsBoolean()
  @IsOptional()
  evening?: boolean = false

  @IsString()
  @IsOptional()
  eveningStart?: string

  @IsString()
  @IsOptional()
  eveningEnd?: string
}
