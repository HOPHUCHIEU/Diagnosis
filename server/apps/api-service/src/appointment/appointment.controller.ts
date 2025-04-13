import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { AppointmentService } from './appointment.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'
import { AppointmentStatus, AppointmentType } from 'apps/api-service/src/appointment/appointment.enum'
import { query } from 'express'
import { CreateFollowUpDto } from 'apps/api-service/src/appointment/dto/create-follow-up.dto'

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Request() { user }, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(user, createAppointmentDto)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: AppointmentStatus,
    @Query('type') type?: AppointmentType,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('includeFollowUps') includeFollowUps?: boolean
  ) {
    return this.appointmentService.findAll({
      page: +page,
      limit: +limit,
      status,
      type,
      doctorId,
      patientId,
      startDate,
      endDate,
      sortBy,
      sortOrder
    })
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/my-appointment')
  findMyAppointment(
    @Request() { user },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.appointmentService.findMyAppointments(user, {
      page: +page,
      limit: +limit,
      status,
      startDate,
      endDate,
      sortOrder
    })
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id)
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update')
  update(@Request() { user }, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentService.update(user, updateAppointmentDto)
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/cancel')
  cancelAppointment(@Request() { user }, @Body() cancelDto: { id: string; reason?: string }) {
    return this.appointmentService.cancelAppointment(user, cancelDto.id, cancelDto.reason)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/approve/:id')
  approveAppointment(@Request() { user }, @Param('id') id: string) {
    return this.appointmentService.approveAppointment(user, id)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/join/:id')
  joinVideoCall(@Request() { user }, @Param('id') id: string) {
    return this.appointmentService.joinVideoCall(user, id)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/end/:id')
  endVideoCall(@Request() { user }, @Param('id') id: string) {
    return this.appointmentService.endVideoCall(user, id)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/video-calls/meetings')
  getAllVideoCallMeetings() {
    return this.appointmentService.getAllVideoCallMeetings()
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/video-calls/meetings/:id')
  getVideoCallMeeting(@Param('id') id: string) {
    return this.appointmentService.getVideoCallMeeting(id)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/follow-up/create')
  createFollowUp(@Request() { user }, @Body() createFollowUpDto: CreateFollowUpDto) {
    return this.appointmentService.createFollowUp(user, createFollowUpDto)
  }
}
