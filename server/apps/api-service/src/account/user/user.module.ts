import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'
import { UserProfile, UserProfileSchema } from 'apps/api-service/src/account/user-profile/entities/user-profile.entity'
import { Address, AddressSchema } from 'apps/api-service/src/account/address/entities/address.entity'
import {
  DoctorProfile,
  DoctorProfileSchema
} from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { PatientRecord, PatientRecordSchema } from 'apps/api-service/src/patient-record/entities/patient-record.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: Address.name, schema: AddressSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: PatientRecord.name, schema: PatientRecordSchema }
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
