export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface DoctorScheduleDay {
  date: string
  shifts: {
    shift: 'morning' | 'afternoon' | 'evening'
    startTime: string
    endTime: string
    timeSlots: TimeSlot[]
  }[]
}

export interface AppointmentRequest {
  doctorId: string
  patientId: string
  appointmentDate: string
  timeSlot: {
    startTime: string
    endTime: string
  }
  symptoms?: string
  note?: string
}

export interface Prescription {
  medicines: {
    id: string
    name: string
    usage: string
    quantity: number
    unit: string
    price: number
  }[]
  totalAmount: number
}

export interface BufferObject {
  buffer: {
    type: 'Buffer'
    data: number[]
  }
}

export interface Profile {
  _id: BufferObject
  firstName: string
  lastName: string
}

export interface UserWithProfile {
  _id: BufferObject
  profile: Profile | null
}

export interface VideoCallInfo {
  provider: string
  meetingUrl: string
  meetingId: string
  password: string | null
  joinedAt?: string
}

export interface Appointment {
  _id: BufferObject
  patient: UserWithProfile
  doctor: UserWithProfile
  appointmentDate: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  type: 'video_call' | 'in_person'
  appointmentFee: number
  isRescheduled: boolean
  isReminded: boolean
  isVideoCallStarted: boolean
  isVideoCallEnded: boolean
  isFollowUp: boolean
  followUpAppointments: Appointment[]
  createdAt: string
  updatedAt: string
  cancelReason?: string
  cancelledAt?: string
  cancelledBy?: BufferObject
  updatedBy?: BufferObject
  approvedAt?: string
  approvedBy?: BufferObject
  videoCallInfo?: VideoCallInfo
  medicalInfo?: {
    symptoms?: string
    reason?: string
    notes?: string
    currentMedications?: string[]
  }
  __v: number
}

export interface PaginationResponse<T> {
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  appointments: T[]
}

export interface AppointmentResponse {
  data: {
    appointments: Appointment[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

interface MedicalInfo {
  symptoms?: string
  reason?: string
  notes?: string
  currentMedications?: string[]
}

export interface AppointmentDetail extends Appointment {
  cancelReason?: string
  cancelledAt?: string
  cancelledBy?: BufferObject
  updatedBy?: BufferObject
  approvedAt?: string
  approvedBy?: BufferObject
  videoCallInfo?: VideoCallInfo
  medicalInfo?: MedicalInfo
}

export interface AppointmentDetailResponse {
  data: AppointmentDetail
}
