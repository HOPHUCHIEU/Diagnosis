import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { DoctorProfileService } from './doctor-profile.service'
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'

@Controller('doctor-profile')
export class DoctorProfileController {
  constructor(private readonly doctorProfileService: DoctorProfileService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() createDoctorProfileDto: CreateDoctorProfileDto) {
    return this.doctorProfileService.create(createDoctorProfileDto)
  }

  @Get('/all')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('specialties') specialties?: string[],
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.doctorProfileService.findAll({ page: +page, limit: +limit, specialties, search, sortBy, sortOrder })
  }

  @Get('/specialties')
  findAllSpecialties(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.doctorProfileService.findAllSpecialties({
      page: +page,
      limit: +limit,
      search,
      sortBy,
      sortOrder
    })
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.doctorProfileService.findOne(id)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update')
  update(@Request() { user }, @Body() updateDoctorProfileDto: UpdateDoctorProfileDto) {
    return this.doctorProfileService.update(user, updateDoctorProfileDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.doctorProfileService.remove(id)
  }
}
