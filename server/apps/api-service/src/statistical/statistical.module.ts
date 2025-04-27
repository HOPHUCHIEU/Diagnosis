import { Module } from '@nestjs/common'
import { StatisticalService } from './statistical.service'
import { StatisticalController } from './statistical.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'
import { Appointment, AppointmentSchema } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { UserPackage, UserPackageSchema } from 'apps/api-service/src/appointment-package/entities/user-package.entity'
import { Payment, PaymentSchema } from 'apps/api-service/src/payment/entities/payment.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: UserPackage.name, schema: UserPackageSchema },
      { name: Payment.name, schema: PaymentSchema }
    ])
  ],
  controllers: [StatisticalController],
  providers: [StatisticalService]
})
export class StatisticalModule {}
