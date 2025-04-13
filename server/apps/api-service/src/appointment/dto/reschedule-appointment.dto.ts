import { Type } from 'class-transformer'
import { IsDateString, IsNotEmpty, IsString, Matches } from 'class-validator'

export class RescheduleAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: Date

  @IsNotEmpty()
  @IsString()
  startTime: string

  @IsNotEmpty()
  @IsString()
  endTime: string
}
