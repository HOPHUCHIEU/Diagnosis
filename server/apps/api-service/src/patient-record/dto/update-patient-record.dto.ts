import { PartialType } from '@nestjs/mapped-types'
import { CreatePatientRecordDto } from './create-patient-record.dto'

export class UpdatePatientRecordDto extends PartialType(CreatePatientRecordDto) {}
