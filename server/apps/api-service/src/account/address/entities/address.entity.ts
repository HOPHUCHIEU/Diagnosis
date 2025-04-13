import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

Schema({ timestamps: true })
export class Address extends Document {
  @Prop()
  address: string

  @Prop()
  street: string

  @Prop()
  ward: string

  @Prop()
  district: string

  @Prop()
  province: string
}

export const AddressSchema = SchemaFactory.createForClass(Address)
