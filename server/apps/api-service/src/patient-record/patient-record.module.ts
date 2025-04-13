import { Module } from '@nestjs/common'
import { PatientRecordService } from './patient-record.service'
import { PatientRecordController } from './patient-record.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { PatientRecord, PatientRecordSchema } from 'apps/api-service/src/patient-record/entities/patient-record.entity'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PatientRecord.name, schema: PatientRecordSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [PatientRecordController],
  providers: [PatientRecordService]
})
export class PatientRecordModule {}
