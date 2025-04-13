import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class AppointmentPackage extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true, min: 1 })
  appointmentCount: number

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: Number, default: 365 })
  validityPeriod: number // Số ngày gói có hiệu lực sau khi mua

  @Prop({ type: [String] })
  features: string[] // Các tính năng đặc biệt của gói
}

export const AppointmentPackageSchema = SchemaFactory.createForClass(AppointmentPackage)
AppointmentPackageSchema.index({ isActive: 1 })
AppointmentPackageSchema.index({ price: 1 })
