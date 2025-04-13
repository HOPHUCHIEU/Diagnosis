import { Module } from '@nestjs/common'
import { AppointmentPackageService } from './appointment-package.service'
import { AppointmentPackageController } from './appointment-package.controller'
import { MongooseModule } from '@nestjs/mongoose'
import {
  AppointmentPackage,
  AppointmentPackageSchema
} from 'apps/api-service/src/appointment-package/entities/appointment-package.entity'
import { UserPackage, UserPackageSchema } from 'apps/api-service/src/appointment-package/entities/user-package.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppointmentPackage.name, schema: AppointmentPackageSchema },
      { name: UserPackage.name, schema: UserPackageSchema }
    ])
  ],
  controllers: [AppointmentPackageController],
  providers: [AppointmentPackageService]
})
export class AppointmentPackageModule {}
