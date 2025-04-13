import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResendVerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string
}
