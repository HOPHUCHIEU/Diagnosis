import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { StatisticalService } from './statistical.service'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'

@Controller('statistical')
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}

  @Roles(Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/doctor')
  getDoctorStatistics(@Request() { user }) {
    return this.statisticalService.getDoctorStatistics(user)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/dashboard')
  getDashboardStatistics() {
    return this.statisticalService.getDashboardStatistics()
  }
}
