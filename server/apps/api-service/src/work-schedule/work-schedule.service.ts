import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto'
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto'
import { InjectModel } from '@nestjs/mongoose'
import { WorkSchedule } from 'apps/api-service/src/work-schedule/entities/work-schedule.entity'
import { Model, Types } from 'mongoose'
import { approvalStatus } from 'apps/api-service/src/work-schedule/work-schedule.enum'
import { SessionApprovalDto } from 'apps/api-service/src/work-schedule/dto/session-approval.dto'
import { SessionRejectionDto } from 'apps/api-service/src/work-schedule/dto/session-reject.dto'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { CreateMultiDayScheduleDto } from 'apps/api-service/src/work-schedule/dto/create-multiple-day-schedule.dto'
import { DailyScheduleDto } from 'apps/api-service/src/work-schedule/dto/daily-schedule.dto'
import { Appointment } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { isValid, format } from 'date-fns'
import { AppointmentStatus } from 'apps/api-service/src/appointment/appointment.enum'

@Injectable()
export class WorkScheduleService {
  @InjectModel(WorkSchedule.name)
  private readonly workScheduleModel: Model<WorkSchedule>

  @InjectModel(DoctorProfile.name)
  private readonly doctorProfileModel: Model<DoctorProfile>

  @InjectModel(Appointment.name)
  private readonly appointmentModel: Model<Appointment>

  async create(createWorkScheduleDto: CreateWorkScheduleDto): Promise<WorkSchedule> {
    const { date, doctorId, schedules } = createWorkScheduleDto
    const dateObject = new Date(date)

    const existingSchedule = await this.workScheduleModel
      .findOne({
        doctor: new Types.ObjectId(doctorId),
        date: dateObject
      })
      .exec()

    if (!existingSchedule) {
      const createdWorkSchedule = new this.workScheduleModel({
        doctor: new Types.ObjectId(doctorId),
        date: dateObject,
        schedules: this.ensureRequiredFields(schedules),
        defaultConsultationDuration: createWorkScheduleDto.defaultConsultationDuration
      })

      return (await createdWorkSchedule.save()).toObject()
    }

    // If schedule exists, check if we can update specific sessions
    const updatedSchedules = { ...existingSchedule.schedules }
    let scheduleUpdated = false

    // Check each session (morning, afternoon, evening)
    const sessions = ['morning', 'afternoon', 'evening']

    for (const session of sessions) {
      // Only process this session if it's included in the request
      if (schedules[session] !== undefined) {
        const approvalStatusField = `${session}ApprovalStatus`

        // Only allow updating if the session was rejected or doesn't exist
        if (updatedSchedules[approvalStatusField] === approvalStatus.Rejected || updatedSchedules[session] === false) {
          // Update the session fields
          updatedSchedules[session] = schedules[session]
          updatedSchedules[`${session}Start`] = schedules[`${session}Start`] || ''
          updatedSchedules[`${session}End`] = schedules[`${session}End`] || ''
          updatedSchedules[approvalStatusField] = approvalStatus.Pending
          updatedSchedules[`${session}RejectionReason`] = ''

          scheduleUpdated = true
        }
      }
    }

    // If no sessions were updated, return null to indicate no changes
    if (!scheduleUpdated) {
      return null
    }

    // Update the existing schedule with the modified sessions
    existingSchedule.schedules = updatedSchedules

    // Update consultation duration if provided
    if (createWorkScheduleDto.defaultConsultationDuration) {
      existingSchedule.defaultConsultationDuration = createWorkScheduleDto.defaultConsultationDuration
    }

    existingSchedule.markModified('schedules')
    return (await existingSchedule.save()).toObject()
  }

  async createMultiDay(createMultiDayScheduleDto: CreateMultiDayScheduleDto): Promise<{
    successful: WorkSchedule[]
    failed: { date: Date; reason: string }[]
  }> {
    const { doctorId, daySchedules, defaultConsultationDuration } = createMultiDayScheduleDto

    const results = {
      successful: [],
      failed: []
    }

    // Process each day schedule
    for (const daySchedule of daySchedules) {
      try {
        // Create a standard DTO for a single day
        const singleDayDto: CreateWorkScheduleDto = {
          doctorId,
          date: daySchedule.date,
          schedules: daySchedule.schedules,
          defaultConsultationDuration
        }

        // Use the existing create method for each day
        const result = await this.create(singleDayDto)

        if (result) {
          results.successful.push(result)
        } else {
          // If result is null, it means the schedule exists and couldn't be updated
          results.failed.push({
            date: daySchedule.date,
            reason: 'Schedule exists and cannot be updated (sessions are not rejected or disabled)'
          })
        }
      } catch (error) {
        results.failed.push({
          date: daySchedule.date,
          reason: error.message || 'Unknown error occurred'
        })
      }
    }

    return results
  }

  async createRecurringSchedule(recurringScheduleDto: {
    doctorId: string
    startDate: Date
    endDate: Date
    daysOfWeek: number[] // 0 = Sunday, 1 = Monday, etc.
    scheduleTemplate: DailyScheduleDto
    defaultConsultationDuration?: number
  }): Promise<{
    successful: WorkSchedule[]
    failed: { date: Date; reason: string }[]
  }> {
    const {
      doctorId,
      startDate,
      endDate,
      daysOfWeek,
      scheduleTemplate,
      defaultConsultationDuration = 30
    } = recurringScheduleDto

    const start = new Date(startDate)
    const end = new Date(endDate)
    const daySchedules: { date: Date; schedules: DailyScheduleDto }[] = []

    // Generate all dates between start and end that match the specified days of week
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() // 0 = Sunday, 1 = Monday, etc.

      if (daysOfWeek.includes(dayOfWeek)) {
        // This is a day we want to schedule
        daySchedules.push({
          date: new Date(d), // Create a new Date object to avoid reference issues
          schedules: { ...scheduleTemplate } // Clone the template
        })
      }
    }

    return this.createMultiDay({
      doctorId,
      daySchedules,
      defaultConsultationDuration
    })
  }

  async approveSession(scheduleId: string, approvalDto: SessionApprovalDto) {
    const schedule = await this.workScheduleModel.findById(scheduleId)
    if (!schedule) {
      throw new NotFoundException('Work schedule not found')
    }

    const { session } = approvalDto

    const approvalStatusField = `${session}ApprovalStatus`
    schedule.markModified(`schedules.${approvalStatusField}`)
    schedule.schedules[approvalStatusField] = approvalStatus.Approved

    await schedule.save()

    return { message: `${session} session approved successfully` }
  }

  async rejectSession(scheduleId: string, rejectionDto: SessionRejectionDto) {
    const schedule = await this.workScheduleModel.findById(scheduleId)

    if (!schedule) {
      throw new NotFoundException('Work schedule not found')
    }

    const { session, rejectionReason } = rejectionDto

    const approvalStatusField = `${session}ApprovalStatus`
    const rejectionReasonField = `${session}RejectionReason`

    schedule.markModified(`schedules.${approvalStatusField}`)
    schedule.markModified(`schedules.${rejectionReasonField}`)

    schedule.schedules[approvalStatusField] = approvalStatus.Rejected
    schedule.schedules[rejectionReasonField] = rejectionReason

    await schedule.save()
    return { message: `${session} session rejected successfully` }
  }

  async findAll(status?: string, doctorId?: string, startDate?: string, endDate?: string) {
    const filter: any = {}

    if (status) {
      const statusConditions = [
        { 'schedules.morningApprovalStatus': status },
        { 'schedules.afternoonApprovalStatus': status },
        { 'schedules.eveningApprovalStatus': status }
      ]
      filter.$or = statusConditions
    }

    if (doctorId) {
      filter.doctor = new Types.ObjectId(doctorId)
    }

    // Add date range filtering if both dates are provided
    if (startDate && endDate) {
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

      const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0)
      const end = new Date(endYear, endMonth - 1, endDay + 1, 23, 59, 59, 999)

      filter.date = {
        $gte: start,
        $lte: end
      }
    }

    const total = await this.workScheduleModel.countDocuments(filter)

    const schedules = await this.workScheduleModel
      .find(filter)
      .populate({
        path: 'doctor',
        select: 'profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    return {
      data: schedules
    }
  }

  async getDoctorAvailabilityWithBookings(
    doctorProfileId: string,
    startDateStr: string,
    endDateStr?: string
  ): Promise<any> {
    // Validate doctor exists
    const doctorProfile = await this.doctorProfileModel.findById(doctorProfileId)
    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found')
    }

    const doctorId = doctorProfile.doctor.toString()

    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)

    const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0)
    const endDate = new Date(endYear, endMonth - 1, endDay + 1, 23, 59, 59, 999)

    if (!isValid(startDate) || !isValid(endDate)) {
      throw new BadRequestException('Invalid date format')
    }

    // Find all work schedules for this doctor in the date range
    const workSchedules = await this.workScheduleModel
      .find({
        doctor: new Types.ObjectId(doctorId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ date: 1 })
      .lean()
      .exec()

    // Find all appointments for this doctor in the date range
    const appointments = await this.appointmentModel
      .find({
        doctor: doctorId,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: {
          $nin: [AppointmentStatus.Cancelled, AppointmentStatus.Completed]
        }
      })
      .lean()
      .exec()

    const appointmentsByDate = appointments.reduce((acc, appointment) => {
      const dateString = format(new Date(appointment.appointmentDate), 'yyyy-MM-dd')

      if (!acc[dateString]) {
        acc[dateString] = []
      }

      acc[dateString].push({
        id: appointment._id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status
      })

      return acc
    }, {})

    // Combine schedules with appointments
    const result = workSchedules.map((schedule) => {
      const dateString = format(new Date(schedule.date), 'yyyy-MM-dd')

      // Only include sessions that are approved
      const availableSessions = {}
      const sessions = ['morning', 'afternoon', 'evening']

      for (const session of sessions) {
        if (schedule.schedules[session] && schedule.schedules[`${session}ApprovalStatus`] === approvalStatus.Approved) {
          availableSessions[session] = {
            start: schedule.schedules[`${session}Start`],
            end: schedule.schedules[`${session}End`]
          }
        }
      }

      return {
        id: schedule._id,
        date: dateString,
        availableSessions,
        bookedSlots: appointmentsByDate[dateString] || [],
        defaultConsultationDuration: schedule.defaultConsultationDuration
      }
    })

    return result
  }

  async findByDoctorId(doctorProfileId: string, includeAll = false, startDate?: string, endDate?: string) {
    const doctorProfile = await this.doctorProfileModel.findById(doctorProfileId)
    console.log(doctorProfile.doctor)
    const filter: any = {
      doctor: new Types.ObjectId(doctorProfile.doctor.toString())
    }

    if (!includeAll) {
      filter.$or = [
        { 'schedules.morningApprovalStatus': approvalStatus.Approved },
        { 'schedules.afternoonApprovalStatus': approvalStatus.Approved },
        { 'schedules.eveningApprovalStatus': approvalStatus.Approved }
      ]
    }

    if (startDate && endDate) {
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

      const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0)
      const end = new Date(endYear, endMonth - 1, endDay + 1, 23, 59, 59, 999)

      console.log(start, end)

      filter.date = {
        $gte: start,
        $lte: end
      }
    }

    const schedules = await this.workScheduleModel
      .find(filter)
      .populate({
        path: 'doctor',
        select: 'profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName fullName'
        }
      })
      .sort({ date: 1 })
      .lean()
      .exec()

    if (!schedules || schedules.length === 0) {
      return []
    }

    return schedules
  }

  async update(id: string, updateWorkScheduleDto: UpdateWorkScheduleDto) {
    const schedule = await this.workScheduleModel.findById(id)

    if (!schedule) {
      throw new NotFoundException('Work schedule not found')
    }

    if (updateWorkScheduleDto.defaultConsultationDuration) {
      schedule.defaultConsultationDuration = updateWorkScheduleDto.defaultConsultationDuration
    }

    if (updateWorkScheduleDto.date) {
      schedule.date = new Date(updateWorkScheduleDto.date)
    }

    if (updateWorkScheduleDto.schedules) {
      schedule.schedules = this.ensureRequiredFields(updateWorkScheduleDto.schedules)
    }

    if (updateWorkScheduleDto.doctorId && updateWorkScheduleDto.doctorId !== schedule.doctor.toString()) {
      throw new BadRequestException('Cannot change the doctor associated with a work schedule')
    }

    return (await schedule.save()).toObject()
  }

  private ensureRequiredFields(dailySchedule: any): any {
    return {
      morning: dailySchedule?.morning ?? false,
      morningStart: dailySchedule?.morningStart ?? '',
      morningEnd: dailySchedule?.morningEnd ?? '',
      morningApprovalStatus: dailySchedule?.morningApprovalStatus ?? approvalStatus.Pending,
      morningRejectionReason: dailySchedule?.morningRejectionReason ?? '',

      afternoon: dailySchedule?.afternoon ?? false,
      afternoonStart: dailySchedule?.afternoonStart ?? '',
      afternoonEnd: dailySchedule?.afternoonEnd ?? '',
      afternoonApprovalStatus: dailySchedule?.afternoonApprovalStatus ?? approvalStatus.Pending,
      afternoonRejectionReason: dailySchedule?.afternoonRejectionReason ?? '',

      evening: dailySchedule?.evening ?? false,
      eveningStart: dailySchedule?.eveningStart ?? '',
      eveningEnd: dailySchedule?.eveningEnd ?? '',
      eveningApprovalStatus: dailySchedule?.eveningApprovalStatus ?? approvalStatus.Pending,
      eveningRejectionReason: dailySchedule?.eveningRejectionReason ?? ''
    }
  }

  async remove(id: string) {
    const schedule = await this.workScheduleModel.findById(id)

    if (!schedule) {
      throw new NotFoundException('Work schedule not found')
    }

    await this.workScheduleModel.findByIdAndDelete(id)

    return { message: 'Work schedule deleted successfully' }
  }
}
