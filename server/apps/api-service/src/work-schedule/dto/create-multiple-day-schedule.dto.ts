import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'
import { DailyScheduleDto } from './daily-schedule.dto'

export class DayScheduleEntry {
  @IsNotEmpty()
  @IsDateString()
  date: Date

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  schedules: DailyScheduleDto
}

export class CreateMultiDayScheduleDto {
  @IsNotEmpty()
  @IsString()
  doctorId: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DayScheduleEntry)
  daySchedules: DayScheduleEntry[]

  @IsNumber()
  @IsOptional()
  defaultConsultationDuration?: number = 30
}
