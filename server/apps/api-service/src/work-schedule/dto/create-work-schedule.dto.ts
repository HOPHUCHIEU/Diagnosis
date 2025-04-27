import { Type } from 'class-transformer'
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { DailyScheduleDto } from 'apps/api-service/src/work-schedule/dto/daily-schedule.dto'

export class CreateWorkScheduleDto {
  @IsNotEmpty()
  @IsString()
  doctorId: string

  @IsNotEmpty()
  @IsDateString()
  date: Date

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  schedules: DailyScheduleDto

  @IsNumber()
  @IsOptional()
  defaultConsultationDuration?: number = 30
}
