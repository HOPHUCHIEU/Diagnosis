import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Payment, PaymentSchema } from 'apps/api-service/src/payment/entities/payment.entity'
import {
  AppointmentPackage,
  AppointmentPackageSchema
} from 'apps/api-service/src/appointment-package/entities/appointment-package.entity'
import { UserPackage, UserPackageSchema } from 'apps/api-service/src/appointment-package/entities/user-package.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: AppointmentPackage.name, schema: AppointmentPackageSchema },
      { name: UserPackage.name, schema: UserPackageSchema }
    ])
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
