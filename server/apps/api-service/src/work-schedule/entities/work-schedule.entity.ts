import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { approvalStatus } from 'apps/api-service/src/work-schedule/work-schedule.enum'
import { Type } from 'class-transformer'
import { Document, Types } from 'mongoose'

@Schema({ _id: false })
class DailySchedule {
  @Prop({ type: Boolean, default: false })
  morning: boolean

  @Prop({ type: String })
  morningStart: string

  @Prop({ type: String })
  morningEnd: string

  @Prop({ type: String, default: approvalStatus.Pending })
  morningApprovalStatus: string

  @Prop({ type: String, default: '' })
  morningRejectionReason: string

  @Prop({ type: Boolean, default: false })
  afternoon: boolean

  @Prop({ type: String })
  afternoonStart: string

  @Prop({ type: String })
  afternoonEnd: string

  @Prop({ type: String, default: approvalStatus.Pending })
  afternoonApprovalStatus: string

  @Prop({ type: String, default: '' })
  afternoonRejectionReason: string

  @Prop({ type: Boolean, default: false })
  evening: boolean

  @Prop({ type: String })
  eveningStart: string

  @Prop({ type: String })
  eveningEnd: string

  @Prop({ type: String, default: approvalStatus.Pending })
  eveningApprovalStatus: string

  @Prop({ type: String, default: '' })
  eveningRejectionReason: string
}

@Schema({ timestamps: true })
export class WorkSchedule extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  @Type(() => User)
  doctor: User | Types.ObjectId

  @Prop({ type: Date, required: true })
  date: Date

  @Prop({ type: DailySchedule, default: {} })
  schedules: DailySchedule

  @Prop({ type: Number, default: 30 })
  defaultConsultationDuration: number // Thời gian tư vấn mặc định (phút)
}

export const WorkScheduleSchema = SchemaFactory.createForClass(WorkSchedule)
WorkScheduleSchema.index({ doctor: 1 })
WorkScheduleSchema.index({ 'schedules.date': 1 })
