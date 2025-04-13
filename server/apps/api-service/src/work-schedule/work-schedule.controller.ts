import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import { WorkScheduleService } from './work-schedule.service'
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto'
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'
import { SessionApprovalDto } from 'apps/api-service/src/work-schedule/dto/session-approval.dto'
import { SessionRejectionDto } from 'apps/api-service/src/work-schedule/dto/session-reject.dto'
import { CreateMultiDayScheduleDto } from 'apps/api-service/src/work-schedule/dto/create-multiple-day-schedule.dto'

@Controller('work-schedule')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  @Roles(Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Body() createWorkScheduleDto: CreateWorkScheduleDto) {
    return this.workScheduleService.create(createWorkScheduleDto)
  }

  @Roles(Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create-multi-day')
  createMultiDay(@Body() createMultiDayScheduleDto: CreateMultiDayScheduleDto) {
    return this.workScheduleService.createMultiDay(createMultiDayScheduleDto)
  }

  @Roles(Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create-recurring')
  createRecurringSchedule(
    @Body()
    recurringScheduleDto: {
      doctorId: string
      startDate: Date
      endDate: Date
      daysOfWeek: number[]
      scheduleTemplate: any
      defaultConsultationDuration?: number
    }
  ) {
    return this.workScheduleService.createRecurringSchedule(recurringScheduleDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/approve-session/:id')
  approveSession(@Param('id') id: string, @Body() approvalDto: SessionApprovalDto) {
    return this.workScheduleService.approveSession(id, approvalDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/reject-session/:id')
  rejectSession(@Param('id') id: string, @Body() rejectionDto: SessionRejectionDto) {
    return this.workScheduleService.rejectSession(id, rejectionDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all')
  findAll(
    @Query('status') status?: string,
    @Query('doctorId') doctorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.workScheduleService.findAll(status, doctorId, startDate, endDate)
  }

  @Get('/doctor')
  findByDoctorId(
    @Query('id') id: string,
    @Query('includeAll') includeAll?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.workScheduleService.findByDoctorId(id, includeAll, startDate, endDate)
  }

  @Get('/doctor/availability')
  async getDoctorAvailability(
    @Query('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate?: string
  ) {
    return this.workScheduleService.getDoctorAvailabilityWithBookings(id, startDate, endDate)
  }

  @Roles(Role.Admin, Role.Doctor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateWorkScheduleDto: UpdateWorkScheduleDto) {
    return this.workScheduleService.update(id, updateWorkScheduleDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.workScheduleService.remove(id)
  }
}
