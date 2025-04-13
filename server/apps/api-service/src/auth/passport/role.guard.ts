import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler()])

    const roleRequiredClass = this.reflector.get<string>(ROLES_KEY, context.getClass())
    const roleRequired = requiredRoles ?? roleRequiredClass

    if (!roleRequired) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    const userRole = user?.role
    const userID = user?.sub

    return requiredRoles.includes(user?.role)
  }
}
