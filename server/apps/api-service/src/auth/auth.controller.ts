import { Body, Controller, Inject, Post, Request, UseGuards } from '@nestjs/common'
import { ChangePasswordDto } from 'apps/api-service/src/account/user/dto/change-password.dto'
import { CreateUserDto } from 'apps/api-service/src/account/user/dto/create-user.dto'
import { ForgotPasswordDto } from 'apps/api-service/src/account/user/dto/forgot-password.dto'
import { ResendVerifyEmailDto } from 'apps/api-service/src/account/user/dto/resend-verify-email.dto'
import { ResetPasswordDto } from 'apps/api-service/src/account/user/dto/reset-password.dto'
import { VerifyEmailDto } from 'apps/api-service/src/account/user/dto/verify-email.dto'
import { AuthService } from 'apps/api-service/src/auth/auth.service'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { LocalAuthGuard } from 'apps/api-service/src/auth/passport/local-auth.guard'

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req) {
    return this.authService.login(req.user)
  }

  @Post('/register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body)
  }

  @Post('/verify-email')
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.authService.verifyEmail(body)
  }

  @Post('/resend-verify-email')
  resendVerifyEmail(@Body() body: ResendVerifyEmailDto) {
    return this.authService.resendVerifyEmail(body)
  }

  @Post('/forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body)
  }

  @Post('/reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-password')
  changePassword(@Request() user, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(user, body)
  }
}
