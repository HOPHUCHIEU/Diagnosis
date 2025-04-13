import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { Document, Types } from 'mongoose'
import { Type } from 'class-transformer'
import { AppointmentStatus, AppointmentType, VideoProvider } from 'apps/api-service/src/appointment/appointment.enum'
import { Payment } from 'apps/api-service/src/payment/entities/payment.entity'

@Schema({ _id: false })
class MedicalInfo {
  @Prop({ type: String })
  symptoms: string // Triệu chứng

  @Prop({ type: String })
  reason: string // Lý do khám

  @Prop({ type: [String] })
  currentMedications: string[] // Thuốc đang sử dụng

  @Prop({ type: String })
  notes: string // Ghi chú thêm
}

@Schema({ _id: false })
class VideoCallInfo {
  @Prop({ type: String, enum: VideoProvider, required: true })
  provider: VideoProvider

  @Prop({ type: String, required: true })
  meetingUrl: string

  @Prop({ type: String })
  meetingId: string

  @Prop({ type: String })
  password: string

  @Prop({ type: Date })
  joinedAt: Date

  @Prop({ type: Date })
  endedAt: Date

  @Prop({ type: Number })
  duration: number // in minutes
}

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  patient: User | Types.ObjectId // Bệnh nhân

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  doctor: User | Types.ObjectId // Bác sĩ

  @Prop({ type: Date, required: true })
  appointmentDate: Date // Ngày hẹn

  @Prop({ type: String, required: true })
  startTime: string // Giờ bắt đầu

  @Prop({ type: String, required: true })
  endTime: string // Giờ kết thúc

  @Prop({ type: String, enum: AppointmentStatus, default: AppointmentStatus.Pending })
  status: AppointmentStatus // Trạng thái cuộc hẹn

  @Prop({ type: MedicalInfo })
  medicalInfo: MedicalInfo // Thông tin y tế

  @Prop({ type: Types.ObjectId, ref: Payment.name })
  @Type(() => Payment)
  payment: Payment | Types.ObjectId // Reference to payment

  @Prop({ type: Number, required: true })
  appointmentFee: number // Thông tin thanh toán

  @Prop({ type: Boolean, default: false })
  isRescheduled: boolean // Đã đổi lịch

  @Prop({ type: Types.ObjectId, ref: Appointment.name })
  previousAppointment: Types.ObjectId // Lịch hẹn trước đó (nếu đã đổi lịch)

  @Prop({ type: String })
  cancelReason: string // Lý do hủy (nếu có)

  @Prop({ type: Types.ObjectId, ref: User.name })
  cancelledBy: Types.ObjectId // Người hủy (bác sĩ hoặc bệnh nhân)

  @Prop({ type: Types.ObjectId, ref: User.name })
  approvedBy: Types.ObjectId // Người phê duyệt

  @Prop({ type: Date })
  approvedAt: Date

  @Prop({ type: Date })
  cancelledAt: Date

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy: Types.ObjectId

  @Prop({ type: Boolean, default: false })
  isReminded: boolean // Đã gửi nhắc nhở

  @Prop({ type: String, enum: AppointmentType, required: true, default: AppointmentType.IN_PERSON })
  type: AppointmentType

  @Prop({ type: VideoCallInfo })
  videoCallInfo: VideoCallInfo

  @Prop({ type: Boolean, default: false })
  isVideoCallStarted: boolean

  @Prop({ type: Boolean, default: false })
  isVideoCallEnded: boolean

  @Prop({ type: Boolean, default: false })
  isFollowUp: boolean // Đánh dấu là lịch tái khám

  @Prop({ type: Types.ObjectId, ref: Appointment.name })
  @Type(() => Appointment)
  originalAppointment: Types.ObjectId // Lịch hẹn gốc (nếu là lịch tái khám)

  @Prop({ type: [{ type: Types.ObjectId, ref: Appointment.name }] })
  @Type(() => Appointment)
  followUpAppointments: Appointment[] | Types.ObjectId[] // Danh sách các lịch tái khám (nếu là lịch hẹn gốc)

  @Prop({ type: String })
  followUpNotes: string // Ghi chú về tái khám

  @Prop({ type: Date })
  recommendedFollowUpDate: Date
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)
AppointmentSchema.index({ type: 1 })
AppointmentSchema.index({ 'videoCallInfo.provider': 1 })
AppointmentSchema.index({ isVideoCallStarted: 1 })
AppointmentSchema.index({ patient: 1, appointmentDate: -1 })
AppointmentSchema.index({ doctor: 1, appointmentDate: -1 })
AppointmentSchema.index({ status: 1 })
AppointmentSchema.index({ 'payment.status': 1 })
AppointmentSchema.index({ appointmentDate: 1 })
