import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { Type } from 'class-transformer'
import { Document, Types } from 'mongoose'

@Schema({ _id: false })
class Education {
  @Prop({ type: String, required: true })
  degree: string // Bằng cấp

  @Prop({ type: String, required: true })
  university: string // Trường đại học

  @Prop({ type: Number, required: true })
  graduationYear: number // Năm tốt nghiệp

  @Prop({ type: String })
  specialization: string // Chuyên ngành
}

@Schema({ _id: false })
class Certificate {
  @Prop({ type: String, required: true })
  name: string // Tên chứng chỉ

  @Prop({ type: String, required: true })
  issuedBy: string // Nơi cấp

  @Prop({ type: Date, required: true })
  issueDate: Date // Ngày cấp

  @Prop({ type: Date })
  expiryDate: Date // Ngày hết hạn
}

@Schema({ timestamps: true })
export class DoctorProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  doctor: User | Types.ObjectId

  @Prop({ type: String, required: true })
  licenseNumber: string // Số giấy phép hành nghề

  @Prop({ type: [String], required: true })
  specialties: string[] // Chuyên khoa

  @Prop({ type: Number, default: 0 })
  yearsOfExperience: number // Số năm kinh nghiệm

  @Prop({ type: [Education], required: true })
  education: Education[] // Học vấn

  @Prop({ type: [Certificate] })
  certificates: Certificate[] // Chứng chỉ

  @Prop({ type: [String] })
  languages: string[] // Ngôn ngữ giao tiếp

  @Prop({ type: String })
  biography: string // Tiểu sử

  @Prop({ type: [String] })
  achievements: string[] // Thành tựu

  @Prop({ type: Number, default: 0 })
  consultationFee: number // Phí tư vấn

  @Prop({ type: Boolean, default: true })
  isAvailable: boolean // Trạng thái có thể đặt lịch

  @Prop({ type: String })
  profileImage: string // Ảnh hồ sơ

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  rating: number // Điểm đánh giá trung bình
}

export const DoctorProfileSchema = SchemaFactory.createForClass(DoctorProfile)

DoctorProfileSchema.index({ specialties: 1 })
DoctorProfileSchema.index({ 'workSchedule.workingDays': 1 })
DoctorProfileSchema.index({ rating: -1 })
