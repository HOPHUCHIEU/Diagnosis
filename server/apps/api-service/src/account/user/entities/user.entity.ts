import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { UserProfile } from 'apps/api-service/src/account/user-profile/entities/user-profile.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { Transform, Type } from 'class-transformer'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class User extends Document {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true, type: String, enum: Role, default: Role.Guest })
  role: Role

  @Prop()
  confirmationCode: string

  @Prop()
  confirmationCodeExpired: Date

  @Prop()
  invitationCode: string

  @Prop()
  invitationCodeExpired: Date

  @Prop()
  lastLogin: Date

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: false })
  isVerified: boolean

  @Prop({ type: Types.ObjectId, ref: UserProfile.name })
  @Type(() => UserProfile)
  profile: UserProfile | Types.ObjectId
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ phone: 1 }, { sparse: true })
UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })
