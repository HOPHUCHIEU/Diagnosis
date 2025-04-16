import { User } from './user.type'

export interface Lifestyle {
  smoking: boolean
  alcohol: boolean
  exercise: string
  diet: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Insurance {
  number: string
  provider: string
  expired: string
}

export interface PatientRecord {
  _id: string | Buffer
  patient: User
  occupation: string
  bloodType: string
  height: number
  weight: number
  allergies: string[]
  chronicDiseases: string[]
  familyHistory: string
  surgeryHistory: string
  isPregnant: boolean
  currentMedications: string[]
  lifestyle: Lifestyle
  emergencyContact: EmergencyContact
  insurance: Insurance
  createdAt: string
  updatedAt: string
}

export type CreatePatientRecordInput = Omit<PatientRecord, '_id' | 'patient' | 'createdAt' | 'updatedAt'> & {
  patient: string
}

export type UpdatePatientRecordInput = Partial<CreatePatientRecordInput>
