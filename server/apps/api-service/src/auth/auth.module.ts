import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from 'apps/api-service/src/account/user/user.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LocalStrategy } from 'apps/api-service/src/auth/passport/local.strategy'
import { JwtStrategy } from 'apps/api-service/src/auth/passport/jwt.strategy'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'

@Module({
  imports: [
    UserModule,
    PassportModule,
    // MailModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET_KEY')
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
