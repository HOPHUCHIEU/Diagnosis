import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
  IsInt,
  IsPositive
} from 'class-validator'
import { Type } from 'class-transformer'

class EducationDto {
  @IsNotEmpty()
  @IsString()
  degree: string

  @IsNotEmpty()
  @IsString()
  university: string

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  graduationYear: number

  @IsOptional()
  @IsString()
  specialization: string
}

class CertificateDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  issuedBy: string

  @IsNotEmpty()
  @IsDateString()
  issueDate: Date

  @IsOptional()
  @IsDateString()
  expiryDate: Date
}

export class CreateDoctorProfileDto {
  @IsNotEmpty()
  @IsString()
  public doctorId: string

  @IsNotEmpty()
  @IsString()
  licenseNumber: string

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  specialties: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  @ArrayMinSize(1)
  education: EducationDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages: string[]

  @IsOptional()
  @IsString()
  biography: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee: number

  @IsOptional()
  @IsBoolean()
  isAvailable: boolean

  @IsOptional()
  @IsString()
  profileImage: string
}
