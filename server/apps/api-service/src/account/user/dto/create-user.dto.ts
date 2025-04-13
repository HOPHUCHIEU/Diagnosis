import { Match } from 'apps/api-service/src/core/decorators/match.decorator'
import {
  IsEmail,
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

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string

  @IsString()
  @IsNotEmpty()
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
}
