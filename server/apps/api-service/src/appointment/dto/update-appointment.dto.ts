import { PartialType } from '@nestjs/mapped-types'
import { CreateAppointmentDto } from './create-appointment.dto'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { AppointmentStatus } from 'apps/api-service/src/appointment/appointment.enum'

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus
}
