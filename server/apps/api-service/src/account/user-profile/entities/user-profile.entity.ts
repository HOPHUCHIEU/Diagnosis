import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { gender } from 'apps/api-service/src/account/user-profile/user-profile.enum'
import { Address } from 'apps/api-service/src/account/address/entities/address.entity'
import { Expose, Type } from 'class-transformer'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class UserProfile extends Document {
  @Prop()
  firstName: string

  @Prop()
  lastName: string

  @Expose()
  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`
  }

  @Prop({ nullable: true })
  avatar: string

  @Prop({ nullable: true })
  birth: Date

  @Prop({ type: String, enum: gender, default: gender.Other })
  gender: string

  @Prop()
  phone: string

  @Prop({ type: Types.ObjectId, ref: Address.name })
  @Type(() => Address)
  address: Address | Types.ObjectId
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile)
