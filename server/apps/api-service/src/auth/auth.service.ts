import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ChangePasswordDto } from 'apps/api-service/src/account/user/dto/change-password.dto'
import { CreateUserDto } from 'apps/api-service/src/account/user/dto/create-user.dto'
import { ForgotPasswordDto } from 'apps/api-service/src/account/user/dto/forgot-password.dto'
import { ResendVerifyEmailDto } from 'apps/api-service/src/account/user/dto/resend-verify-email.dto'
import { ResetPasswordDto } from 'apps/api-service/src/account/user/dto/reset-password.dto'
import { VerifyEmailDto } from 'apps/api-service/src/account/user/dto/verify-email.dto'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { UserService } from 'apps/api-service/src/account/user/user.service'
import { JwtPayload } from 'apps/api-service/src/auth/auth.type'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { trimStringFields } from 'apps/api-service/src/helper/helper'
import { MailService } from 'apps/api-service/src/mail/mail.service'
import * as bcrypt from 'bcryptjs'
import { randomBytes, randomInt } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const response = await this.userService.getUserByEmail(email)

    if (!response) {
      throw new UnauthorizedException()
    }

    if (!response.isVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED')
    }

    if (response && bcrypt.compareSync(password, response.password)) {
      await this.userService.updateLastLoginToNow(response)
      return response
    } else {
      throw new UnauthorizedException('PASSWORD_INCORRECT')
    }

    return null
  }

  async login(user: User) {
    if (!user) {
      throw new NotFoundException()
    }

    const payload: JwtPayload = {
      email: user.email,
      id: user.id
    }

    return {
      role: user.role,
      expiresIn: user.role === Role.User ? '30d' : '1d',
      tokenType: 'Bearer',
      access_token: this.jwtService.sign(payload, {
        expiresIn: user.role === Role.User ? '30d' : '1d'
      })
    }
  }

  async register(createUserDto: CreateUserDto) {
    createUserDto = trimStringFields(createUserDto)
    const invitationCode = randomInt(100000, 999999).toString()
    const invitationCodeExpired = new Date(Date.now() + 10 * 60 * 1000)
    const user = await this.userService.handleRegister({ createUserDto, invitationCode, invitationCodeExpired })
    this.mailService.sendInviteCode(createUserDto.email, invitationCode).catch((error) => {
      console.log(error)
    })
    const userResponse = user.toObject()
    delete userResponse.__v
    delete userResponse.password

    return userResponse
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userService.getUserByEmail(verifyEmailDto.email)
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND')
    }
    if (user.isVerified) {
      return {
        message: 'Email verified successfully'
      }
    }
    if (user.invitationCode !== verifyEmailDto.code) {
      throw new BadRequestException('INVALID_CODE')
    }

    if (new Date() > user.invitationCodeExpired) {
      throw new BadRequestException('CODE_EXPIRED')
    }

    const result = await this.userService.updateUser(user, {
      isVerified: true,
      invitationCode: null,
      invitationCodeExpired: null
    })

    return {
      message: 'Email verified successfully'
    }
  }

  async resendVerifyEmail(resendVerifyEmailDto: ResendVerifyEmailDto) {
    const user = await this.userService.getUserByEmail(resendVerifyEmailDto.email)
    if (!user) {
      throw new NotFoundException()
    }
    if (user.isVerified) {
      throw new BadRequestException('EMAIL_ALREADY_VERIFIED')
    }

    const invitationCode = randomInt(100000, 999999).toString()
    const invitationCodeExpired = new Date(Date.now() + 10 * 60 * 1000)
    await this.userService.updateUser(user, {
      invitationCode,
      invitationCodeExpired
    })
    this.mailService.sendInviteCode(resendVerifyEmailDto.email, invitationCode).catch((error) => {
      console.log(error)
    })

    return {
      message: 'New verification code has been sent to your email'
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.getUserByEmail(forgotPasswordDto.email)
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND')
    }

    const confirmationCode = randomInt(100000, 999999).toString()
    const confirmationCodeExpired = new Date(Date.now() + 10 * 60 * 1000)
    await this.userService.updateUser(user, {
      confirmationCode,
      confirmationCodeExpired
    })

    this.mailService.sendConfirmationCode(forgotPasswordDto.email, confirmationCode).catch((error) => {
      console.log(error)
    })

    return {
      message: 'Confirmation code has been sent to your email'
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userService.getUserByEmail(resetPasswordDto.email)
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND')
    }

    if (!user.confirmationCode) {
      throw new BadRequestException('NO_CONFIRMATION_CODE')
    }

    if (user.confirmationCode !== resetPasswordDto.code) {
      throw new BadRequestException('INVALID_CODE')
    }

    if (new Date() > user.confirmationCodeExpired) {
      throw new BadRequestException('CODE_EXPIRED')
    }

    await this.userService.updatePassword(user, resetPasswordDto.password)

    return {
      message: 'Password reset successfully'
    }
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND')
    }

    if (!bcrypt.compareSync(changePasswordDto.oldPassword, user.password)) {
      throw new BadRequestException('OLD_PASSWORD_INCORRECT')
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10)
    await this.userService.updatePassword(user, changePasswordDto.password)

    return {
      message: 'Password changed successfully'
    }
  }
}
