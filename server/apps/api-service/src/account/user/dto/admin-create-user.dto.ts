import { Role } from 'apps/api-service/src/auth/role.enum'
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator'
import { PasswordValidation, PasswordValidationRequirement } from 'class-validator-password-check'

const passwordRequirement: PasswordValidationRequirement = {
  mustContainLowerLetter: false,
  mustContainNumber: true,
  mustContainUpperLetter: true
}

export class AdminCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string

  @IsOptional()
  @IsString()
  // @IsNotEmpty()
  // @MinLength(6)
  // @MaxLength(20)
  // @Validate(PasswordValidation, [passwordRequirement])
  public password: string

  @IsOptional()
  firstName?: string

  @IsOptional()
  lastName?: string

  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string

  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @IsOptional()
  street?: string

  @IsOptional()
  ward?: string

  @IsOptional()
  district?: string

  @IsOptional()
  province?: string

  @IsOptional()
  isVerified?: boolean
}
