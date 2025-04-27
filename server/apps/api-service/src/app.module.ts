import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { CoreModule } from 'apps/api-service/src/core/core.module'
import { UserModule } from './account/user/user.module'
import { UserProfileModule } from './account/user-profile/user-profile.module'
import { DatabaseModule } from '@app/common'
import { SeederModule } from 'apps/api-service/src/seeders/seeder.module'
import { AuthModule } from 'apps/api-service/src/auth/auth.module'
import { MailModule } from './mail/mail.module'
import { PatientRecordModule } from './patient-record/patient-record.module'
import { DoctorProfileModule } from './account/doctor-profile/doctor-profile.module'
import { AddressModule } from 'apps/api-service/src/account/address/address.module'
import { AppointmentModule } from './appointment/appointment.module'
import { PaymentModule } from './payment/payment.module'
import { ReviewModule } from './review/review.module'
import { WorkScheduleModule } from './work-schedule/work-schedule.module'
import { AppointmentPackageModule } from './appointment-package/appointment-package.module'
import { ChatbotModule } from './chatbot/chatbot.module'
import { StatisticalModule } from './statistical/statistical.module'

@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    SeederModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    UserModule,
    AuthModule,
    UserProfileModule,
    MailModule,
    AddressModule,
    PatientRecordModule,
    DoctorProfileModule,
    AppointmentModule,
    PaymentModule,
    ReviewModule,
    WorkScheduleModule,
    AppointmentPackageModule,
    StatisticalModule,
    ChatbotModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
