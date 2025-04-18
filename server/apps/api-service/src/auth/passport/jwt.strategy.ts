import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { JwtPayload } from 'apps/api-service/src/auth/auth.type'
import { UserService } from 'apps/api-service/src/account/user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY') || 'defaultSecret' // Đảm bảo giá trị fallback
    })
  }

  async validate(payload: JwtPayload): Promise<User> {
    if (payload.id) {
      const response = await this.userService.getUserById({ id: payload.id })
      return response
    }
    return null
  }
}
