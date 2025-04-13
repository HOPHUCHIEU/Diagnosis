import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewController } from './review.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Review, ReviewSchema } from 'apps/api-service/src/review/entities/review.entity'
import { Appointment, AppointmentSchema } from 'apps/api-service/src/appointment/entities/appointment.entity'
import {
  DoctorProfile,
  DoctorProfileSchema
} from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema }
    ])
  ],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule {}
