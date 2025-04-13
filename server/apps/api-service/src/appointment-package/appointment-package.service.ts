import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateAppointmentPackageDto } from './dto/create-appointment-package.dto'
import { UpdateAppointmentPackageDto } from './dto/update-appointment-package.dto'
import { InjectModel } from '@nestjs/mongoose'
import { AppointmentPackage } from 'apps/api-service/src/appointment-package/entities/appointment-package.entity'
import { Model, Types } from 'mongoose'
import { UserPackage } from 'apps/api-service/src/appointment-package/entities/user-package.entity'
import { UserPackageStatus } from 'apps/api-service/src/appointment-package/appointment-package.enum'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'

@Injectable()
export class AppointmentPackageService {
  @InjectModel(AppointmentPackage.name)
  private readonly appointmentPackageModel: Model<AppointmentPackage>

  @InjectModel(UserPackage.name)
  private readonly userPackageModel: Model<UserPackage>

  async create(createAppointmentPackageDto: CreateAppointmentPackageDto) {
    const newPackage = new this.appointmentPackageModel(createAppointmentPackageDto)
    return (await newPackage.save()).toObject()
  }

  async findAll() {
    return this.appointmentPackageModel.find().lean().exec()
  }

  async findAllActive() {
    return this.appointmentPackageModel.find({ isActive: true }).lean().exec()
  }

  async findMyAppointmentPackage(user: User) {
    const userPackages = await this.userPackageModel
      .find({
        user: new Types.ObjectId(user._id.toString()),
        status: UserPackageStatus.Active,
        expiryDate: { $gte: new Date() }
      })
      .populate({
        path: 'package',
        select: 'name description appointmentCount validityPeriod'
      })
      .lean()
      .exec()

    // Create a summary object
    const summary = {
      totalPackages: userPackages.length,
      totalRemainingAppointments: userPackages.reduce((sum, pkg) => sum + pkg.remainingAppointments, 0),
      totalUsedAppointments: userPackages.reduce((sum, pkg) => sum + pkg.totalAppointments, 0),
      packages: userPackages.map((pkg: any) => ({
        id: pkg._id,
        packageName: pkg.package.name,
        remainingAppointments: pkg.remainingAppointments,
        usedAppointments: pkg.totalAppointments,
        purchaseDate: pkg.purchaseDate,
        expiryDate: pkg.expiryDate,
        status: pkg.status
      }))
    }

    return summary
  }

  async findOne(id: string) {
    return this.appointmentPackageModel.findById(id).lean().exec()
  }

  async update(id: string, updateAppointmentPackageDto: UpdateAppointmentPackageDto) {
    const appointmentPackage = await this.appointmentPackageModel.findById(id).lean().exec()
    if (!appointmentPackage) {
      throw new NotFoundException('Appointment package not found')
    }
    return this.appointmentPackageModel
      .findByIdAndUpdate(id, updateAppointmentPackageDto, {
        new: true
      })
      .lean()
      .exec()
  }

  async remove(id: string) {
    return this.appointmentPackageModel.findByIdAndDelete(id).lean().exec()
  }
}
