import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JwtStrategyName } from 'apps/api-service/src/auth/constant'

@Injectable()
export class JwtAuthGuard extends AuthGuard(JwtStrategyName) {}
