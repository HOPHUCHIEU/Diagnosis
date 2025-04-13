import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string

  @IsString()
  @IsNotEmpty()
  public code: string
}
