import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { AppointmentPackage } from './appointment-package.entity'
import { Document, Types } from 'mongoose'
import { Type } from 'class-transformer'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { Payment } from 'apps/api-service/src/payment/entities/payment.entity'
import { UserPackageStatus } from 'apps/api-service/src/appointment-package/appointment-package.enum'

@Schema({ timestamps: true })
export class UserPackage extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  user: User | Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: AppointmentPackage.name, required: true })
  @Type(() => AppointmentPackage)
  package: AppointmentPackage | Types.ObjectId

  @Prop({ required: true, min: 0 })
  remainingAppointments: number

  @Prop({ required: true, min: 0 })
  totalAppointments: number

  @Prop({ required: true })
  purchaseDate: Date

  @Prop({ required: true })
  expiryDate: Date

  @Prop({ type: String, enum: UserPackageStatus, default: UserPackageStatus.Active })
  status: UserPackageStatus

  @Prop({ type: Types.ObjectId, ref: Payment.name })
  @Type(() => Payment)
  payment: Payment | Types.ObjectId
}

export const UserPackageSchema = SchemaFactory.createForClass(UserPackage)
UserPackageSchema.index({ user: 1, status: 1 })
UserPackageSchema.index({ expiryDate: 1 })
UserPackageSchema.index({ remainingAppointments: 1 })
