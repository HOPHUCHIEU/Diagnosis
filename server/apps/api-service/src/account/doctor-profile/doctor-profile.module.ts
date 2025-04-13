import { Module } from '@nestjs/common'
import { DoctorProfileService } from './doctor-profile.service'
import { DoctorProfileController } from './doctor-profile.controller'
import { MongooseModule } from '@nestjs/mongoose'
import {
  DoctorProfile,
  DoctorProfileSchema
} from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [DoctorProfileController],
  providers: [DoctorProfileService]
})
export class DoctorProfileModule {}
