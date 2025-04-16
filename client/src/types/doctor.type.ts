import { User } from './user.type'

export interface Education {
  degree: string
  university: string
  graduationYear: number
  specialization: string
}

export interface Certificate {
  name: string
  issuedBy: string
  issueDate: string
  expiryDate: string
}

export interface DoctorProfile {
  _id: string
  doctor: User
  doctorId: string
  doctorName: string
  licenseNumber: string
  specialties: string[]
  yearsOfExperience: number
  education: Education[]
  certificates: Certificate[]
  languages: string[]
  biography: string
  achievements: string[]
  consultationFee: number
  isAvailable: boolean
  profileImage?: string
}

export type CreateDoctorProfileInput = Omit<DoctorProfile, 'id' | 'createdAt' | 'updatedAt'>
