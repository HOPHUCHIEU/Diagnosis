import { Module } from '@nestjs/common'
import { WorkScheduleService } from './work-schedule.service'
import { WorkScheduleController } from './work-schedule.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { WorkSchedule, WorkScheduleSchema } from 'apps/api-service/src/work-schedule/entities/work-schedule.entity'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'
import {
  DoctorProfile,
  DoctorProfileSchema
} from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { Appointment, AppointmentSchema } from 'apps/api-service/src/appointment/entities/appointment.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkSchedule.name, schema: WorkScheduleSchema },
      { name: User.name, schema: UserSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: Appointment.name, schema: AppointmentSchema }
    ])
  ],
  controllers: [WorkScheduleController],
  providers: [WorkScheduleService]
})
export class WorkScheduleModule {}
