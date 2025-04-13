import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { PatientRecordService } from './patient-record.service'
import { CreatePatientRecordDto } from 'apps/api-service/src/patient-record/dto/create-patient-record.dto'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'
import { UpdatePatientRecordDto } from 'apps/api-service/src/patient-record/dto/update-patient-record.dto'

@Controller('patient-record')
export class PatientRecordController {
  constructor(private readonly patientRecordService: PatientRecordService) {}

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Request() { user }, @Body() createPatientRecordDto: CreatePatientRecordDto) {
    return this.patientRecordService.create(user, createPatientRecordDto)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.patientRecordService.findAll({ page: +page, limit: +limit, search, sortBy, sortOrder })
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/my-record')
  findMyRecord(@Request() { user }) {
    return this.patientRecordService.findByPatientId(user._id.toString())
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  findOne(@Request() { user }, @Param('id') id: string) {
    return this.patientRecordService.findOne(user, id)
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update')
  update(@Request() { user }, @Body() updatePatientRecordDto: UpdatePatientRecordDto) {
    return this.patientRecordService.update(user, updatePatientRecordDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.patientRecordService.remove(id)
  }
}
