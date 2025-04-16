import { Prop, Schema } from '@nestjs/mongoose'
import { BaseDocument } from '../interfaces/base.interface'

@Schema()
export class BaseSchema implements BaseDocument {
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date
}
