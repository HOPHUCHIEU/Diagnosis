import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { AppointmentPackageService } from './appointment-package.service'
import { CreateAppointmentPackageDto } from './dto/create-appointment-package.dto'
import { UpdateAppointmentPackageDto } from './dto/update-appointment-package.dto'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'

@Controller('appointment-package')
export class AppointmentPackageController {
  constructor(private readonly appointmentPackageService: AppointmentPackageService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() createAppointmentPackageDto: CreateAppointmentPackageDto) {
    return this.appointmentPackageService.create(createAppointmentPackageDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all')
  findAll() {
    return this.appointmentPackageService.findAll()
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all-active')
  findAllActive() {
    return this.appointmentPackageService.findAllActive()
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/my-appointment-package')
  findMyAppointmentPackage(@Request() { user }) {
    return this.appointmentPackageService.findMyAppointmentPackage(user)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.appointmentPackageService.findOne(id)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateAppointmentPackageDto: UpdateAppointmentPackageDto) {
    return this.appointmentPackageService.update(id, updateAppointmentPackageDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.appointmentPackageService.remove(id)
  }
}
