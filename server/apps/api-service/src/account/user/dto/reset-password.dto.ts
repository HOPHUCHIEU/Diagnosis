import { Match } from 'apps/api-service/src/core/decorators/match.decorator'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator'
import { PasswordValidation, PasswordValidationRequirement } from 'class-validator-password-check'

const passwordRequirement: PasswordValidationRequirement = {
  mustContainLowerLetter: false,
  mustContainNumber: true,
  mustContainUpperLetter: true
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string

  @IsString()
  @IsNotEmpty()
  public code: string

  @IsString()
  @IsNotEmpty()
  // @MinLength(6)
  // @MaxLength(20)
  // @Validate(PasswordValidation, [passwordRequirement])
  public password: string

  // @IsOptional()
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(6)
  // @MaxLength(20)
  // @Validate(PasswordValidation, [passwordRequirement])
  // @Match('password', { message: 'Passwords do not match' })
  // public confirmPassword: string
}
