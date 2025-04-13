import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { gender } from 'apps/api-service/src/account/user-profile/user-profile.enum'
import { CreateUserDto } from 'apps/api-service/src/account/user/dto/create-user.dto'

export class UpdateProfileDto extends PartialType(CreateUserDto) {
  @IsOptional()
  avatar: string

  @IsOptional()
  birth?: Date

  @IsOptional()
  @IsEnum(gender)
  gender?: gender

  @IsOptional()
  public address?: string

  @IsOptional()
  public street?: string

  @IsOptional()
  public ward?: string

  @IsOptional()
  public district?: string

  @IsOptional()
  public province?: string
}
