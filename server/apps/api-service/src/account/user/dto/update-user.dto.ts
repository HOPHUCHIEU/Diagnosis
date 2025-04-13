import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { gender } from 'apps/api-service/src/account/user-profile/user-profile.enum'
import { AdminCreateUserDto } from 'apps/api-service/src/account/user/dto/admin-create-user.dto'

export class UpdateUserDto extends PartialType(AdminCreateUserDto) {
  @IsNotEmpty()
  id: string

  @IsOptional()
  avatar: string

  @IsOptional()
  birth?: Date

  @IsOptional()
  @IsEnum(gender)
  gender?: gender

  @IsBoolean()
  @IsOptional()
  disabled: boolean
}
