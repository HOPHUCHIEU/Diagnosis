export type RoleType = 'user' | 'admin' | 'doctor'
export type EducationLevelType = 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'PhD'

export type CreateUserInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  fullName: string
  birth: string | Date | null | undefined
  phone: string
  address: string
  gender: 'male' | 'female'
  avatar: string
  role: RoleType
  disabled: boolean
  isVerified: boolean
}
export type UpdateInfoUserInput = {
  firstName: string
  lastName: string
  fullName?: string
  birth: string | Date | null | undefined
  gender: 'male' | 'female'
  phone: string
  address: string
  avatar?: string
  role?: RoleType
  disabled?: boolean
  isVerified?: boolean
}

export interface User {
  _id: string | Buffer
  key?: string
  email: string
  doctorProfileId?: string | Buffer
  patientId?: string | Buffer
  profile: {
    _id: string | Buffer
    firstName: string
    lastName: string
    fullName: string
    birth: string | Date | null | undefined
    phone: string
    address: string
    avatar: string
    gender: 'male' | 'female'
  }
  role: RoleType
  disabled: boolean
  isVerified: boolean
  updatedAt: string
  createdAt: string
}
