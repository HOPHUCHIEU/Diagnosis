import { Module } from '@nestjs/common'
import { AppointmentService } from './appointment.service'
import { AppointmentController } from './appointment.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Appointment, AppointmentSchema } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'
import {
  DoctorProfile,
  DoctorProfileSchema
} from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { WorkSchedule, WorkScheduleSchema } from 'apps/api-service/src/work-schedule/entities/work-schedule.entity'
import { UserPackage, UserPackageSchema } from 'apps/api-service/src/appointment-package/entities/user-package.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: WorkSchedule.name, schema: WorkScheduleSchema },
      { name: UserPackage.name, schema: UserPackageSchema }
    ])
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class AppointmentModule {}
