import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Type } from 'class-transformer'
import { Appointment } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { PaymentMethod, PaymentStatus } from 'apps/api-service/src/payment/payment.enum'
import { AppointmentPackage } from 'apps/api-service/src/appointment-package/entities/appointment-package.entity'

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'AppointmentPackage' })
  @Type(() => AppointmentPackage)
  package: AppointmentPackage | Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  user: User | Types.ObjectId

  @Prop({ type: Number, required: true })
  total_price: number // Amount to pay

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.Pending })
  status: PaymentStatus // Payment status

  @Prop({ type: Date })
  payment_date: Date // Date of payment

  @Prop({ type: Date })
  refund_date: Date // Date of refund (if applicable)

  // VNPay specific fields
  @Prop({ type: String })
  transaction_id: string // VNPay transaction ID

  @Prop({ type: String, enum: PaymentMethod, nullable: true })
  bank_code?: PaymentMethod // Bank code used for payment

  @Prop({ type: Object })
  response_data: Record<string, any> // Raw response from payment gateway

  @Prop({ type: String })
  ip_address: string // IP address of user making payment

  @Prop({ type: String })
  error_message: string // Error message if payment fails
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)
PaymentSchema.index({ package: 1 })
PaymentSchema.index({ user: 1 })
PaymentSchema.index({ status: 1 })
PaymentSchema.index({ payment_date: -1 })
