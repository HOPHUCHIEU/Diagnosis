import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Appointment } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { PatientRecord } from 'apps/api-service/src/patient-record/entities/patient-record.entity'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { WorkSchedule } from 'apps/api-service/src/work-schedule/entities/work-schedule.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { isPast, isValid, format } from 'date-fns'
import { AppointmentStatus, AppointmentType, VideoProvider } from 'apps/api-service/src/appointment/appointment.enum'
import { approvalStatus } from 'apps/api-service/src/work-schedule/work-schedule.enum'
import { UserPackage } from 'apps/api-service/src/appointment-package/entities/user-package.entity'
import { UserPackageStatus } from 'apps/api-service/src/appointment-package/appointment-package.enum'
import { ConfigService } from '@nestjs/config'
import { CreateFollowUpDto } from 'apps/api-service/src/appointment/dto/create-follow-up.dto'
import { MailService } from 'apps/api-service/src/mail/mail.service'

@Injectable()
export class AppointmentService {
  constructor(
    private readonly configService: ConfigService,
    private mailService: MailService
  ) {}

  @InjectModel(Appointment.name)
  private readonly appointmentModel: Model<Appointment>

  @InjectModel(User.name)
  private readonly userModel: Model<User>

  @InjectModel(DoctorProfile.name)
  private readonly doctorProfileModel: Model<DoctorProfile>

  @InjectModel(WorkSchedule.name)
  private readonly workScheduleModel: Model<WorkSchedule>

  @InjectModel(UserPackage.name)
  private readonly userPackageModel: Model<UserPackage>

  async create(user: User, createAppointmentDto: CreateAppointmentDto) {
    const { patient, doctor, appointmentDate, startTime, endTime, type, medicalInfo } = createAppointmentDto

    if (user.role === Role.User && patient !== user._id.toString()) {
      throw new BadRequestException('Cannot create appointment for another user')
    }

    await this.validatePatientAndDoctor(patient, doctor)
    const doctorProfile = await this.validateDoctorAvailability(doctor)

    const appointmentDateTime = this.validateAppointmentDateTime(appointmentDate)
    this.validateTimeFormat(startTime, endTime)
    this.validateTimeSequence(startTime, endTime)

    // Get doctor's work schedule for the appointment date
    const doctorWorkSchedule = await this.getValidDoctorWorkSchedule(doctor, appointmentDateTime)
    if (!doctorWorkSchedule) {
      throw new BadRequestException('Doctor does not have a valid work schedule for this date')
    }

    // Parse time components for validation
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    // Validate against doctor's working hours
    this.validateAgainstDoctorHours(doctorWorkSchedule.schedules, startHour, startMinute, endHour, endMinute)

    // Create full date-time objects
    const startDateTime = new Date(appointmentDate)
    startDateTime.setHours(startHour, startMinute, 0)

    const endDateTime = new Date(appointmentDate)
    endDateTime.setHours(endHour, endMinute, 0)

    // Calculate appointment duration and fee
    const appointmentDuration = endHour * 60 + endMinute - (startHour * 60 + startMinute)
    const appointmentFee = this.calculateAppointmentFee(
      doctorProfile.consultationFee,
      appointmentDuration,
      doctorWorkSchedule.defaultConsultationDuration || 30
    )

    // Check for scheduling conflicts
    await this.checkForConflicts(doctor, appointmentDateTime, startTime, endTime)

    const appointment = new this.appointmentModel({
      patient,
      doctor,
      appointmentDate: appointmentDateTime,
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      type,
      status: AppointmentStatus.Pending,
      medicalInfo,
      appointmentFee,
      createdBy: user._id
    })

    // Initialize video call info if needed
    if (type === AppointmentType.VIDEO_CALL) {
      appointment.isVideoCallStarted = false
    }

    const savedAppointment = await appointment.save()
    return savedAppointment.toObject()
  }

  private async getValidDoctorWorkSchedule(doctorId: string, appointmentDate: Date): Promise<WorkSchedule | null> {
    // Format date to match exact date without time
    const date = new Date(appointmentDate)
    date.setHours(0, 0, 0, 0)

    // Find schedule for the specific date with session approval
    return await this.workScheduleModel
      .findOne({
        doctor: new Types.ObjectId(doctorId),
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        },
        $or: [
          { 'schedules.morningApprovalStatus': approvalStatus.Approved },
          { 'schedules.afternoonApprovalStatus': approvalStatus.Approved },
          { 'schedules.eveningApprovalStatus': approvalStatus.Approved }
        ]
      })
      .exec()
  }

  private validateAgainstDoctorHours(
    daySchedule: any,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ) {
    // Check if appointment time falls within any of the doctor's approved working periods
    let isTimeSlotValid = false
    const requestedStartMinutes = startHour * 60 + startMinute
    const requestedEndMinutes = endHour * 60 + endMinute

    // Check morning schedule if approved
    if (
      daySchedule.morning &&
      daySchedule.morningStart &&
      daySchedule.morningEnd &&
      daySchedule.morningApprovalStatus === approvalStatus.Approved
    ) {
      const [mStartHour, mStartMin] = daySchedule.morningStart.split(':').map(Number)
      const [mEndHour, mEndMin] = daySchedule.morningEnd.split(':').map(Number)

      const morningStartMinutes = mStartHour * 60 + mStartMin
      const morningEndMinutes = mEndHour * 60 + mEndMin

      if (requestedStartMinutes >= morningStartMinutes && requestedEndMinutes <= morningEndMinutes) {
        isTimeSlotValid = true
      }
    }

    // Check afternoon schedule if approved
    if (
      !isTimeSlotValid &&
      daySchedule.afternoon &&
      daySchedule.afternoonStart &&
      daySchedule.afternoonEnd &&
      daySchedule.afternoonApprovalStatus === approvalStatus.Approved
    ) {
      const [aStartHour, aStartMin] = daySchedule.afternoonStart.split(':').map(Number)
      const [aEndHour, aEndMin] = daySchedule.afternoonEnd.split(':').map(Number)

      const afternoonStartMinutes = aStartHour * 60 + aStartMin
      const afternoonEndMinutes = aEndHour * 60 + aEndMin

      if (requestedStartMinutes >= afternoonStartMinutes && requestedEndMinutes <= afternoonEndMinutes) {
        isTimeSlotValid = true
      }
    }

    // Check evening schedule if approved
    if (
      !isTimeSlotValid &&
      daySchedule.evening &&
      daySchedule.eveningStart &&
      daySchedule.eveningEnd &&
      daySchedule.eveningApprovalStatus === approvalStatus.Approved
    ) {
      const [eStartHour, eStartMin] = daySchedule.eveningStart.split(':').map(Number)
      const [eEndHour, eEndMin] = daySchedule.eveningEnd.split(':').map(Number)

      const eveningStartMinutes = eStartHour * 60 + eStartMin
      const eveningEndMinutes = eEndHour * 60 + eEndMin

      if (requestedStartMinutes >= eveningStartMinutes && requestedEndMinutes <= eveningEndMinutes) {
        isTimeSlotValid = true
      }
    }

    if (!isTimeSlotValid) {
      throw new BadRequestException("Appointment time must be within doctor's approved working hours")
    }
  }

  // Rest of the methods remain largely unchanged
  private async validatePatientAndDoctor(patientId: string, doctorId: string) {
    const patientExists = await this.userModel.findById(patientId).exec()
    if (!patientExists) {
      throw new NotFoundException('Patient not found')
    }

    const doctorExists = await this.userModel
      .findOne({
        _id: doctorId,
        role: Role.Doctor
      })
      .exec()

    if (!doctorExists) {
      throw new NotFoundException('Doctor not found')
    }

    return { patientExists, doctorExists }
  }

  private async validateDoctorAvailability(doctorId: string) {
    const doctorProfile = await this.doctorProfileModel.findOne({ doctor: doctorId }).exec()
    if (!doctorProfile || !doctorProfile.isAvailable) {
      throw new BadRequestException('Doctor is not available')
    }
    return doctorProfile
  }

  private validateAppointmentDateTime(appointmentDate: string | Date) {
    const appointmentDateTime = new Date(appointmentDate)
    if (!isValid(appointmentDateTime) || isPast(appointmentDateTime)) {
      throw new BadRequestException('Date is invalid or in the past')
    }
    return appointmentDateTime
  }

  private validateTimeFormat(startTime: string, endTime: string) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new BadRequestException('Invalid time format')
    }
  }

  private validateTimeSequence(startTime: string, endTime: string) {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
      throw new BadRequestException('End time must be after start time')
    }
  }

  private calculateAppointmentFee(baseConsultationFee: number, appointmentDuration: number, standardDuration: number) {
    let appointmentFee = baseConsultationFee

    if (appointmentDuration > standardDuration) {
      const feeRatio = appointmentDuration / standardDuration
      appointmentFee = Math.round(appointmentFee * feeRatio)
    }

    return appointmentFee
  }

  // private async checkForConflicts(doctorId: string, appointmentDate: Date, startTime: string, endTime: string) {
  //   const conflictingAppointment = await this.appointmentModel
  //     .findOne({
  //       doctor: doctorId,
  //       appointmentDate,
  //       status: {
  //         $nin: [AppointmentStatus.Cancelled, AppointmentStatus.Completed]
  //       },
  //       $or: [
  //         // Case 1: New appointment starts during an existing appointment
  //         {
  //           $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }]
  //         },
  //         // Case 2: New appointment ends during an existing appointment
  //         {
  //           $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }]
  //         },
  //         // Case 3: New appointment completely contains an existing one
  //         {
  //           $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }]
  //         },
  //         // Case 4: Existing appointment completely contains new one
  //         {
  //           $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }]
  //         }
  //       ]
  //     })
  //     .exec()

  //   if (conflictingAppointment) {
  //     const statusMessage =
  //       conflictingAppointment.status === AppointmentStatus.Pending ? 'is pending approval' : 'is already booked'

  //     throw new ConflictException(
  //       `Time slot from ${startTime} to ${endTime} ${statusMessage}. Please select a different time.`
  //     )
  //   }
  // }

  async findAll(queryParams: {
    page: number
    limit: number
    status?: AppointmentStatus
    type?: AppointmentType
    doctorId?: string
    patientId?: string
    startDate?: Date
    endDate?: Date
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    includeFollowUps?: boolean
  }) {
    const {
      page,
      limit,
      status,
      type,
      doctorId,
      patientId,
      startDate,
      endDate,
      sortBy = 'appointmentDate',
      sortOrder = 'asc',
      includeFollowUps = false
    } = queryParams
    const filter: any = {}
    if (status) filter.status = status
    if (type) filter.type = type
    if (doctorId) filter.doctor = doctorId
    if (patientId) filter.patient = patientId
    if (!includeFollowUps) {
      filter.isFollowUp = { $ne: true }
    }
    if (startDate || endDate) {
      filter.appointmentDate = {}
      if (startDate) filter.appointmentDate.$gte = new Date(startDate)
      if (endDate) filter.appointmentDate.$lte = new Date(endDate)
    }
    const total = await this.appointmentModel.countDocuments(filter)
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query with pagination
    const appointments = await this.appointmentModel
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()

    const followUpIds = appointments
      .flatMap((appointment) => {
        if (!appointment.followUpAppointments) return []
        return appointment.followUpAppointments.map((id) =>
          id.toString ? id.toString() : id._id ? id._id.toString() : id
        )
      })
      .filter(Boolean)

    if (followUpIds.length > 0) {
      const followUpAppointments = await this.appointmentModel
        .find({ _id: { $in: followUpIds } })
        .lean()
        .exec()

      const followUpMap = new Map(followUpAppointments.map((followUp) => [followUp._id.toString(), followUp]))

      appointments.forEach((appointment) => {
        if (appointment.followUpAppointments && appointment.followUpAppointments.length > 0) {
          appointment.followUpAppointments = appointment.followUpAppointments
            .map((id) => {
              const idString = id.toString ? id.toString() : id._id ? id._id.toString() : id
              const followUp = followUpMap.get(idString) || { _id: idString }
              if (followUp) {
                return followUp as any
              }
            })
            .filter(Boolean)
        }
      })
    }

    return {
      appointments: appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findOne(id: string) {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    if (appointment.followUpAppointments && appointment.followUpAppointments.length > 0) {
      const followUpIds = appointment.followUpAppointments
        .map((id) => (id.toString ? id.toString() : id._id ? id._id.toString() : id))
        .filter(Boolean)

      if (followUpIds.length > 0) {
        const followUpAppointments = await this.appointmentModel
          .find({ _id: { $in: followUpIds } })
          .lean()
          .exec()
        const followUpMap = new Map(followUpAppointments.map((followUp) => [followUp._id.toString(), followUp]))
        appointment.followUpAppointments = appointment.followUpAppointments
          .map((id) => {
            const idString = id.toString ? id.toString() : id._id ? id._id.toString() : id
            const followUp = followUpMap.get(idString) || { _id: idString }
            if (followUp) {
              return followUp as any
            }
          })
          .filter(Boolean)
      }
    }

    return appointment
  }

  async findMyAppointments(
    user: User,
    queryParams: {
      page: number
      limit: number
      status?: AppointmentStatus
      startDate?: Date
      endDate?: Date
      sortOrder?: 'asc' | 'desc'
    }
  ) {
    const { page, limit, status, startDate, endDate, sortOrder = 'asc' } = queryParams

    const filter: any = {}

    if (user.role === Role.User) {
      filter.patient = user._id.toString()
    }

    if (status) filter.status = status

    if (startDate || endDate) {
      filter.appointmentDate = {}
      if (startDate) filter.appointmentDate.$gte = new Date(startDate)
      if (endDate) filter.appointmentDate.$lte = new Date(endDate)
    }

    const total = await this.appointmentModel.countDocuments(filter)

    const appointments = await this.appointmentModel
      .find(filter)
      .sort({ appointmentDate: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()

    const followUpIds = appointments
      .flatMap((appointment) => {
        if (!appointment.followUpAppointments) return []
        return appointment.followUpAppointments.map((id) =>
          id.toString ? id.toString() : id._id ? id._id.toString() : id
        )
      })
      .filter(Boolean)

    if (followUpIds.length > 0) {
      const followUpAppointments = await this.appointmentModel
        .find({ _id: { $in: followUpIds } })
        .lean()
        .exec()

      const followUpMap = new Map(followUpAppointments.map((followUp) => [followUp._id.toString(), followUp]))

      appointments.forEach((appointment) => {
        if (appointment.followUpAppointments && appointment.followUpAppointments.length > 0) {
          appointment.followUpAppointments = appointment.followUpAppointments
            .map((id) => {
              const idString = id.toString ? id.toString() : id._id ? id._id.toString() : id
              const followUp = followUpMap.get(idString) || { _id: idString }
              if (followUp) {
                return followUp as any
              }
            })
            .filter(Boolean)
        }
      })
    }

    return {
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async cancelAppointment(user: User, id: string, reason?: string) {
    const appointment = await this.appointmentModel.findById(id).exec()

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    // Authorization check - only patient, doctor, or admin can cancel
    this.checkAppointmentUpdatePermission(user, appointment)

    // Cannot cancel an appointment that is already completed
    if (appointment.status === AppointmentStatus.Completed) {
      throw new BadRequestException('Cannot cancel a completed appointment')
    }

    // Update the appointment status to cancelled
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: AppointmentStatus.Cancelled,
            cancelReason: reason,
            cancelledBy: user._id,
            cancelledAt: new Date(),
            updatedBy: user._id
          }
        },
        { new: true }
      )
      .populate([
        {
          path: 'patient',
          select: 'email phone profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'email phone profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()

    return updatedAppointment
  }

  async approveAppointment(user: User, id: string) {
    // Only doctors and admins can approve appointments
    if (![Role.Doctor, Role.Admin].includes(user.role)) {
      throw new ForbiddenException('Only doctors or administrators can approve appointments')
    }

    const appointment = await this.appointmentModel.findById(id).populate('patient').exec()

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    // Authorization check for doctors - can only approve their own appointments
    if (user.role === Role.Doctor && appointment.doctor.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only approve your own appointments')
    }

    // Can only approve pending appointments
    if (appointment.status !== AppointmentStatus.Pending) {
      throw new BadRequestException(`Cannot approve appointment with status ${appointment.status}`)
    }

    console.log(appointment)

    const userPackage = await this.userPackageModel
      .findOne({
        user: appointment.patient._id,
        status: UserPackageStatus.Active,
        expiryDate: { $gte: new Date() },
        remainingAppointments: { $gt: 0 }
      })
      .sort({ expiryDate: 1 })
      .exec()

    if (!userPackage) {
      throw new BadRequestException('Patient has no active package with remaining appointments')
    }

    await this.userPackageModel.findByIdAndUpdate(userPackage._id, {
      $inc: { remainingAppointments: -1, totalAppointments: 1 }
    })

    let videoCallInfo = null
    if (appointment.type === AppointmentType.VIDEO_CALL) {
      videoCallInfo = await this.createVideoCallRoom(
        appointment.patient.toString(),
        appointment.doctor.toString(),
        appointment.appointmentDate
      )
    }

    // Update the appointment status to confirmed
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: AppointmentStatus.Confirmed,
            approvedBy: user._id,
            approvedAt: new Date(),
            updatedBy: user._id,
            videoCallInfo: videoCallInfo,
            isVideoCallStarted: false,
            isVideoCallEnded: false
          }
        },
        { new: true }
      )
      .populate([
        {
          path: 'patient',
          select: 'email phone profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'email phone profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()

    return updatedAppointment
  }

  private async createVideoCallRoom(patientId: string, doctorId: string, appointmentDate: Date): Promise<any> {
    try {
      const meetingId = crypto.randomUUID().replace(/-/g, '')

      const meetingDate = format(appointmentDate, 'yyyy-MM-dd HH:mm')

      const clientUrl = this.configService.get('CLIENT_URL')

      const meetingUrl = `${clientUrl}/room/${meetingId}`

      return {
        provider: VideoProvider.ZEGOCLOUD,
        meetingUrl: meetingUrl,
        meetingId: meetingId,
        password: null
      }
    } catch (error) {
      console.error('Failed to create video call room:', error)
      throw new Error('Failed to create video call room')
    }
  }

  // Helper method to check if user has permission to update an appointment
  private checkAppointmentUpdatePermission(user: User, appointment: Appointment) {
    // Admins can update any appointment
    if (user.role === Role.Admin) return true

    // Doctors can only update their own appointments
    if (user.role === Role.Doctor && appointment.doctor.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only update your own appointments')
    }

    // Patients can only update their own appointments
    if (user.role === Role.User && appointment.patient.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only update your own appointments')
    }

    return true
  }

  async update(user: User, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentModel.findById(updateAppointmentDto.id).exec()

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    // Authorization check
    this.checkAppointmentUpdatePermission(user, appointment)

    // If status is changing to Confirmed or Completed, ensure user is a doctor or admin
    if (
      updateAppointmentDto.status &&
      [AppointmentStatus.Confirmed, AppointmentStatus.Completed].includes(updateAppointmentDto.status) &&
      ![Role.Doctor, Role.Admin].includes(user.role)
    ) {
      throw new BadRequestException('Only doctors or administrators can confirm or complete appointments')
    }

    // Create update payload - start with fields from DTO
    const updatePayload: any = { ...updateAppointmentDto }

    // If trying to update time/date, validate the new times
    if (updateAppointmentDto.startTime || updateAppointmentDto.endTime || updateAppointmentDto.appointmentDate) {
      const startTime = updateAppointmentDto.startTime || appointment.startTime
      const endTime = updateAppointmentDto.endTime || appointment.endTime
      const appointmentDate = updateAppointmentDto.appointmentDate
        ? new Date(updateAppointmentDto.appointmentDate)
        : appointment.appointmentDate

      // Validate the new date and time
      this.validateTimeFormat(startTime, endTime)
      this.validateTimeSequence(startTime, endTime)
      const appointmentDateTime = this.validateAppointmentDateTime(appointmentDate)

      // Validate against doctor's schedule
      const doctorWorkSchedule = await this.getValidDoctorWorkSchedule(
        appointment.doctor.toString(),
        appointmentDateTime
      )

      if (!doctorWorkSchedule) {
        throw new BadRequestException('Doctor does not have a valid work schedule for this date')
      }

      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)

      // Validate against doctor's working hours
      this.validateAgainstDoctorHours(doctorWorkSchedule.schedules, startHour, startMinute, endHour, endMinute)

      // Check for conflicts with other appointments
      if (
        appointment.startTime !== startTime ||
        appointment.endTime !== endTime ||
        appointmentDate.toString() !== appointment.appointmentDate.toString()
      ) {
        await this.checkForConflicts(
          appointment.doctor.toString(),
          appointmentDateTime,
          startTime,
          endTime,
          updateAppointmentDto.id
        )
      }

      // Update date time objects if times change
      if (updateAppointmentDto.startTime || updateAppointmentDto.appointmentDate) {
        const startDateTime = new Date(appointmentDate)
        startDateTime.setHours(startHour, startMinute, 0)
        updatePayload.startDateTime = startDateTime // Add to update payload, not DTO
      }

      if (updateAppointmentDto.endTime || updateAppointmentDto.appointmentDate) {
        const endDateTime = new Date(appointmentDate)
        endDateTime.setHours(endHour, endMinute, 0)
        updatePayload.endDateTime = endDateTime // Add to update payload, not DTO
      }
    }

    // Add audit fields to update payload
    updatePayload.updatedBy = user._id
    updatePayload.updatedAt = new Date()

    // Update the appointment
    const updatedAppointment = await this.appointmentModel
      .findByIdAndUpdate(updateAppointmentDto.id, updatePayload, { new: true })
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .exec()

    return updatedAppointment.toObject()
  }

  // Add this method to check for conflicts
  private async checkForConflicts(
    doctorId: string,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    currentAppointmentId?: string
  ) {
    const query: any = {
      doctor: new Types.ObjectId(doctorId),
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0)),
        $lte: new Date(new Date(appointmentDate).setHours(23, 59, 59))
      },
      status: {
        $nin: [AppointmentStatus.Cancelled, AppointmentStatus.Completed]
      },
      $or: [
        // Case 1: New appointment starts during an existing appointment
        {
          $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }]
        },
        // Case 2: New appointment ends during an existing appointment
        {
          $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }]
        },
        // Case 3: New appointment completely contains an existing one
        {
          $and: [{ startTime: { $gte: startTime } }, { endTime: { $lte: endTime } }]
        },
        // Case 4: Existing appointment completely contains new one
        {
          $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }]
        }
      ]
    }

    // Exclude the current appointment from conflict check when updating
    if (currentAppointmentId) {
      query._id = { $ne: new Types.ObjectId(currentAppointmentId) }
    }

    const conflictingAppointment = await this.appointmentModel.findOne(query).exec()

    if (conflictingAppointment) {
      const statusMessage =
        conflictingAppointment.status === AppointmentStatus.Pending ? 'is pending approval' : 'is already booked'

      throw new ConflictException(
        `Time slot from ${startTime} to ${endTime} ${statusMessage}. Please select a different time.`
      )
    }
  }

  async joinVideoCall(user: User, appointmentId: string) {
    const appointment = await this.appointmentModel.findById(appointmentId)

    if (
      !appointment ||
      appointment.status !== AppointmentStatus.Confirmed ||
      appointment.doctor.toString() !== user._id.toString()
    ) {
      throw new BadRequestException('Cannot join: appointment not found or not confirmed')
    }

    return (
      await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          'videoCallInfo.joinedAt': new Date(),
          isVideoCallStarted: true
        },
        { new: true }
      )
    ).toObject()
  }

  async endVideoCall(user: User, appointmentId: string) {
    const appointment = await this.appointmentModel.findById(appointmentId.toString())

    if (!appointment || !appointment.isVideoCallStarted || appointment.doctor.toString() !== user._id.toString()) {
      throw new BadRequestException('Cannot end: call not started')
    }

    const endTime = new Date()
    const startTime = appointment.videoCallInfo?.joinedAt
    const durationMinutes = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : null

    return (
      await this.appointmentModel.findByIdAndUpdate(
        appointmentId,
        {
          'videoCallInfo.endedAt': endTime,
          'videoCallInfo.duration': durationMinutes,
          isVideoCallEnded: true
        },
        { new: true }
      )
    ).toObject()
  }

  async getAllVideoCallMeetings() {
    const query: any = {
      type: AppointmentType.VIDEO_CALL,
      'videoCallInfo.meetingId': { $exists: true }
    }

    const appointments = await this.appointmentModel
      .find(query)
      .select('_id appointmentDate patient doctor status videoCallInfo')
      .sort({ appointmentDate: -1 })
      .lean()
      .exec()

    return appointments.map((appointment) => ({
      appointmentId: appointment._id,
      meetingId: appointment.videoCallInfo?.meetingId
    }))
  }

  async getVideoCallMeeting(meetingId: string) {
    const appointment = await this.appointmentModel
      .findOne({
        type: AppointmentType.VIDEO_CALL,
        'videoCallInfo.meetingId': meetingId
      })
      .select('_id appointmentDate patient doctor status videoCallInfo')
      .lean()
      .exec()

    if (!appointment) {
      return []
    }

    return appointment
  }

  async createFollowUp(user: any, createFollowUpDto: CreateFollowUpDto) {
    const originalAppointment = await this.findOne(createFollowUpDto.originalAppointmentId)

    if (!originalAppointment) {
      throw new NotFoundException('Original appointment not found')
    }

    // Kiểm tra quyền: chỉ bác sĩ phụ trách hoặc admin mới được tạo tái khám
    const isDoctor = user.id === originalAppointment.doctor._id.toString()
    const isAdmin = user.role === Role.Admin

    if (!isDoctor && !isAdmin) {
      throw new ForbiddenException('You do not have permission to create a follow-up appointment')
    }

    const { startTime, endTime, appointmentDate } = createFollowUpDto
    const doctor = originalAppointment.doctor._id.toString()

    const appointmentDateTime = this.validateAppointmentDateTime(appointmentDate)
    this.validateTimeFormat(startTime, endTime)
    this.validateTimeSequence(startTime, endTime)

    // Get doctor's work schedule for the appointment date
    const doctorWorkSchedule = await this.getValidDoctorWorkSchedule(doctor, appointmentDateTime)
    if (!doctorWorkSchedule) {
      throw new BadRequestException('Doctor does not have a valid work schedule for this date')
    }

    // Parse time components for validation
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    // Validate against doctor's working hours
    this.validateAgainstDoctorHours(doctorWorkSchedule.schedules, startHour, startMinute, endHour, endMinute)

    // Create full date-time objects
    const startDateTime = new Date(appointmentDate)
    startDateTime.setHours(startHour, startMinute, 0)

    const endDateTime = new Date(appointmentDate)
    endDateTime.setHours(endHour, endMinute, 0)

    // Calculate appointment duration and fee
    const appointmentDuration = endHour * 60 + endMinute - (startHour * 60 + startMinute)

    // Check for scheduling conflicts
    await this.checkForConflicts(doctor, appointmentDateTime, startTime, endTime)

    let videoCallInfo = null
    if (createFollowUpDto.type === AppointmentType.VIDEO_CALL) {
      videoCallInfo = await this.createVideoCallRoom(
        originalAppointment.patient.toString(),
        originalAppointment.doctor.toString(),
        originalAppointment.appointmentDate
      )
    }

    const followUpAppointment = {
      patient: originalAppointment.patient._id,
      doctor: originalAppointment.doctor._id,
      appointmentDate: createFollowUpDto.appointmentDate,
      startTime: createFollowUpDto.startTime,
      endTime: createFollowUpDto.endTime,
      status: AppointmentStatus.Confirmed,
      type: AppointmentType.VIDEO_CALL,
      appointmentFee: originalAppointment.appointmentFee,
      medicalInfo: {
        reason: createFollowUpDto.reason || 'Tái khám',
        notes: createFollowUpDto.notes || '',
        symptoms: originalAppointment.medicalInfo?.symptoms || '',
        currentMedications: originalAppointment.medicalInfo?.currentMedications || []
      },
      isFollowUp: true,
      originalAppointment: new Types.ObjectId(createFollowUpDto.originalAppointmentId),
      videoCallInfo: videoCallInfo
    }

    const createdFollowUp = await this.appointmentModel.create(followUpAppointment)

    await this.appointmentModel.findOneAndUpdate(
      { _id: createFollowUpDto.originalAppointmentId },
      {
        $push: { followUpAppointments: createdFollowUp._id }
      }
    )

    const patient = await this.userModel.findById(originalAppointment.patient._id).exec()

    await this.mailService.sendNotification(
      patient.email,
      `Tạo lịch tái khám thành công`,
      `Lịch tái khám của bạn đã được tạo thành công. Thông tin lịch hẹn:
      Ngày hẹn: ${format(new Date(createFollowUpDto.appointmentDate), 'dd/MM/yyyy')}
      Giờ bắt đầu: ${createFollowUpDto.startTime}
      Giờ kết thúc: ${createFollowUpDto.endTime}
      Lý do tái khám: ${createFollowUpDto.reason || 'Tái khám'}
      Ghi chú: ${createFollowUpDto.notes || ''}
      Vui lòng kiểm tra lại thông tin lịch hẹn trong ứng dụng.`
    )

    return createdFollowUp.toObject()
  }
}
