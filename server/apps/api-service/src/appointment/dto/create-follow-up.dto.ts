import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { AppointmentType, VideoProvider } from '../appointment.enum'

export class CreateFollowUpDto {
  @IsNotEmpty()
  @IsString()
  originalAppointmentId: string

  @IsNotEmpty()
  @IsDateString()
  appointmentDate: Date

  @IsNotEmpty()
  @IsString()
  startTime: string

  @IsNotEmpty()
  @IsString()
  endTime: string

  @IsOptional()
  @IsString()
  reason: string

  @IsEnum(AppointmentType)
  type: AppointmentType = AppointmentType.VIDEO_CALL

  @IsOptional()
  @IsString()
  notes?: string
}
