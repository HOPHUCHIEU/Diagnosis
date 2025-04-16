import { User } from './user.type'

export type Shift = 'morning' | 'afternoon' | 'evening'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface BufferData {
  type: 'Buffer'
  data: number[]
}

export interface BufferId {
  buffer: BufferData
}

export interface DoctorProfile {
  _id: BufferId
  firstName: string
  lastName: string
}

export interface Doctor {
  _id: BufferId
  profile: DoctorProfile
}

export interface ShiftSchedule {
  morning: boolean
  morningStart: string
  morningEnd: string
  morningApprovalStatus: ApprovalStatus
  morningRejectionReason: string
  afternoon: boolean
  afternoonStart: string
  afternoonEnd: string
  afternoonApprovalStatus: ApprovalStatus
  afternoonRejectionReason: string
  evening: boolean
  eveningStart: string
  eveningEnd: string
  eveningApprovalStatus: ApprovalStatus
  eveningRejectionReason: string
}

export interface DailySchedule {
  _id: BufferId
  doctor: Doctor | null
  date: string
  schedules: ShiftSchedule
  // scheduleEntries: ScheduleEntry[]
  defaultConsultationDuration: number
  createdAt: string
  updatedAt: string
  __v: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface GetSchedulesResponse {
  data: {
    data: DailySchedule[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

export interface DoctorShiftRegistration {
  doctorId: string
  avatar?: string
  scheduleId: string
  doctorName: string
  startTime: string
  endTime: string
  status: ApprovalStatus
  rejectionReason?: string
}

export interface AdminDayShift {
  shift: Shift
  startTime: string
  endTime: string
  doctors: DoctorShiftRegistration[]
}

export interface AdminDaySchedule {
  date: string
  shifts: AdminDayShift[]
}

export interface ShiftDetail {
  id: string
  shift: Shift
  date: string
  startTime: string
  endTime: string
  approvalStatus?: ApprovalStatus
  rejectionReason?: string
}

export interface DaySchedule {
  date: string
  schedules: DayShiftSchedule
}

export interface DoctorScheduleRequest {
  _id?: string
  doctorId: string
  date: string
  shifts: Shift[]
  status: 'pending' | 'approved' | 'rejected'
  note?: string
}

export const SHIFTS: { label: string; value: Shift }[] = [
  { label: 'Ca sáng (7:00 - 11:00)', value: 'morning' },
  { label: 'Ca chiều (13:00 - 17:00)', value: 'afternoon' },
  { label: 'Ca tối (18:00 - 21:00)', value: 'evening' }
]

export type ShiftStartEnd = {
  [K in Shift as `${K}Start`]?: string
} & {
  [K in Shift as `${K}End`]?: string
}

export type ShiftStatus = {
  [K in Shift]: boolean
}

export type ShiftTime = ShiftStatus &
  ShiftStartEnd & {
    [K in Shift as `${K}ApprovalStatus`]?: ApprovalStatus
  } & {
    [K in Shift as `${K}RejectionReason`]?: string
  }

export type DayShift = ShiftTime

export type WeekSchedule = {
  monday: DayShift
  tuesday: DayShift
  wednesday: DayShift
  thursday: DayShift
  friday: DayShift
  saturday: DayShift
  sunday: DayShift
}

export interface CreateScheduleRequest {
  doctorId: string
  initialSchedule: {
    weekStart: string
    weekEnd: string
    dailySchedules: WeekSchedule
  }
  defaultConsultationDuration: number
}

export interface DayShiftSchedule {
  morning?: boolean
  morningStart?: string
  morningEnd?: string
  afternoon?: boolean
  afternoonStart?: string
  afternoonEnd?: string
  evening?: boolean
  eveningStart?: string
  eveningEnd?: string
}

export interface CreateMultiDayScheduleRequest {
  doctorId: string
  daySchedules: DaySchedule[]
  defaultConsultationDuration: number
}

export interface CreateRecurringScheduleRequest {
  doctorId: string
  startDate: string
  endDate: string
  daysOfWeek: number[]
  scheduleTemplate: DayShiftSchedule
  defaultConsultationDuration: number
}

export interface ScheduleEntry {
  weekStart: string
  weekEnd: string
  dailySchedules: WeekSchedule
}

export interface DoctorScheduleResponse {
  _id: {
    buffer: {
      type: string
      data: number[]
    }
  }
  doctor: {
    buffer: {
      type: string
      data: number[]
    }
  }
  // scheduleEntries: ScheduleEntry[]
  defaultConsultationDuration: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GetDoctorScheduleResponse {
  data: DailySchedule[]
}
