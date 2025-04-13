import { Type } from 'class-transformer'
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
  IsDateString,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
  Matches
} from 'class-validator'
import { AppointmentType } from '../appointment.enum'
import { MedicalInfoDto } from 'apps/api-service/src/appointment/dto/medical-info.dto'

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsMongoId()
  patient: string

  @IsNotEmpty()
  @IsMongoId()
  doctor: string

  @IsNotEmpty()
  @IsDateString()
  appointmentDate: Date

  @IsNotEmpty()
  @IsString()
  startTime: string

  @IsNotEmpty()
  @IsString()
  endTime: string

  @IsNotEmpty()
  @IsEnum(AppointmentType)
  type: AppointmentType

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInfoDto)
  medicalInfo?: MedicalInfoDto
}
