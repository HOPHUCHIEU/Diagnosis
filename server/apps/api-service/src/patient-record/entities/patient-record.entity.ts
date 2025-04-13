import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { bloodType } from 'apps/api-service/src/patient-record/patient-record.enum'
import { Type } from 'class-transformer'
import { Document, Types } from 'mongoose'

@Schema({ _id: false })
class Lifestyle {
  @Prop()
  smoking: boolean

  @Prop()
  alcohol: boolean

  @Prop()
  exercise: string

  @Prop()
  diet: string
}

@Schema({ _id: false })
class EmergencyContact {
  @Prop()
  name: string

  @Prop()
  phone: string

  @Prop()
  relationship: string
}

@Schema({ _id: false })
class insurance {
  @Prop()
  number: string

  @Prop()
  provider: string

  @Prop()
  expired: Date
}

@Schema({ timestamps: true })
export class PatientRecord extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name })
  @Type(() => User)
  patient: User | Types.ObjectId

  @Prop()
  occupation: string // Nghề nghiệp

  @Prop({ enum: bloodType })
  bloodType: string

  @Prop({ min: 0, max: 300 })
  height: number

  @Prop({ min: 0, max: 500 })
  weight: number

  @Prop([String])
  allergies: string[] // Dị ứng

  @Prop([String])
  chronicDiseases: string[] // Bệnh mãn tính

  @Prop()
  familyHistory: string // Tiền sử gia đình

  @Prop()
  surgeryHistory: string // Tiền sử phẫu thuật

  @Prop({ default: false })
  isPregnant: boolean // Có thai hay không

  @Prop([String])
  currentMedications: string[] // Thuốc đang sử dụng

  @Prop({ type: Lifestyle })
  @Type(() => Lifestyle)
  lifestyle: Lifestyle

  @Prop({ type: EmergencyContact })
  @Type(() => EmergencyContact)
  emergencyContact: EmergencyContact

  @Prop({ type: insurance })
  @Type(() => insurance)
  insurance: insurance
}

export const PatientRecordSchema = SchemaFactory.createForClass(PatientRecord)
