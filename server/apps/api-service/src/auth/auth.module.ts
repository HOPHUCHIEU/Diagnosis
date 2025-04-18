import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserModule } from 'apps/api-service/src/account/user/user.module'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LocalStrategy } from 'apps/api-service/src/auth/passport/local.strategy'
import { JwtStrategy } from 'apps/api-service/src/auth/passport/jwt.strategy'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'

@Module({
  imports: [
    ConfigModule, // Đảm bảo ConfigModule được import
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule để sử dụng ConfigService
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY') || 'defaultSecret', // Đảm bảo giá trị fallback
        signOptions: { expiresIn: '1h' }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
