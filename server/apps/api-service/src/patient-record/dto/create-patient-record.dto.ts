import { Type } from 'class-transformer'
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsArray,
  IsDate,
  IsPhoneNumber,
  IsMongoId,
  IsNotEmpty
} from 'class-validator'
import { bloodType } from '../patient-record.enum'

class LifestyleDto {
  @IsBoolean()
  @IsOptional()
  smoking: boolean

  @IsBoolean()
  @IsOptional()
  alcohol: boolean

  @IsString()
  @IsOptional()
  exercise: string

  @IsString()
  @IsOptional()
  diet: string
}

class EmergencyContactDto {
  @IsString()
  name: string

  @IsPhoneNumber('VN')
  phone: string

  @IsString()
  relationship: string
}

class InsuranceDto {
  @IsString()
  number: string

  @IsString()
  provider: string

  @IsDate()
  @Type(() => Date)
  expired: Date
}

export class CreatePatientRecordDto {
  @IsNotEmpty()
  @IsString()
  patient: string

  @IsString()
  @IsOptional()
  occupation: string

  @IsEnum(bloodType)
  @IsOptional()
  bloodType: string

  @IsNumber()
  @Min(0)
  @Max(300)
  @IsOptional()
  height: number

  @IsNumber()
  @Min(0)
  @Max(500)
  @IsOptional()
  weight: number

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  chronicDiseases: string[]

  @IsString()
  @IsOptional()
  familyHistory: string

  @IsString()
  @IsOptional()
  surgeryHistory: string

  @IsBoolean()
  @IsOptional()
  isPregnant: boolean

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentMedications: string[]

  @ValidateNested()
  @Type(() => LifestyleDto)
  @IsOptional()
  lifestyle: LifestyleDto

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyContact: EmergencyContactDto

  @ValidateNested()
  @Type(() => InsuranceDto)
  @IsOptional()
  insurance: InsuranceDto
}
