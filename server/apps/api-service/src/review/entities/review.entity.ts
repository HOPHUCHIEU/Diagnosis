import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { Appointment } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { Document, Types } from 'mongoose'
import { Type } from 'class-transformer'

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  patient: User | Types.ObjectId // Người đánh giá

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  doctor: User | Types.ObjectId // Bác sĩ được đánh giá

  @Prop({ type: Types.ObjectId, ref: Appointment.name, required: true })
  @Type(() => Appointment)
  appointment: Appointment | Types.ObjectId // Cuộc hẹn liên quan

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number // Số sao đánh giá (1-5)

  @Prop({ type: String, required: true })
  comment: string // Nội dung đánh giá

  @Prop({ type: Boolean, default: false })
  isVerified: boolean // Đã xác minh là khách hàng thật

  @Prop({ type: [String], default: [] })
  tags: string[] // Tags đánh giá (ví dụ: 'thân thiện', 'chuyên môn cao',...)

  @Prop({ type: Boolean, default: true })
  isVisible: boolean // Hiển thị công khai hay không

  @Prop({ type: String })
  adminReply: string // Phản hồi từ admin/bác sĩ

  @Prop({ type: Date })
  adminReplyAt: Date // Thời gian phản hồi

  @Prop({ type: Date })
  updatedAt: Date
}

export const ReviewSchema = SchemaFactory.createForClass(Review)

// Indexes for better query performance
ReviewSchema.index({ doctor: 1, createdAt: -1 })
ReviewSchema.index({ patient: 1, createdAt: -1 })
ReviewSchema.index({ appointment: 1 })
ReviewSchema.index({ rating: -1 })
ReviewSchema.index({ isVerified: 1 })
ReviewSchema.index({ isVisible: 1 })
