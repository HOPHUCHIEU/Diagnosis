import { PartialType } from '@nestjs/mapped-types'
import { CreateAppointmentPackageDto } from './create-appointment-package.dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateAppointmentPackageDto extends PartialType(CreateAppointmentPackageDto) {}
