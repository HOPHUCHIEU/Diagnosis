import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { LocalStrategyName } from 'apps/api-service/src/auth/constant'

@Injectable()
export class LocalAuthGuard extends AuthGuard(LocalStrategyName) {}
