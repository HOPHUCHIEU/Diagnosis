import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { UserPackageStatus } from 'apps/api-service/src/appointment-package/appointment-package.enum'
import { UserPackage } from 'apps/api-service/src/appointment-package/entities/user-package.entity'
import { AppointmentStatus } from 'apps/api-service/src/appointment/appointment.enum'
import { Appointment } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { Payment } from 'apps/api-service/src/payment/entities/payment.entity'
import { PaymentStatus } from 'apps/api-service/src/payment/payment.enum'
import { Model, Types } from 'mongoose'

@Injectable()
export class StatisticalService {
  @InjectModel(User.name)
  private readonly userModel: Model<User>

  @InjectModel(Appointment.name)
  private readonly appointmentModel: Model<Appointment>

  @InjectModel(UserPackage.name)
  private readonly userPackageModel: Model<UserPackage>

  @InjectModel(Payment.name)
  private readonly paymentModel: Model<Payment>

  async getDoctorStatistics(user: User) {
    const doctorId = user._id

    const totalAppointments = await this.appointmentModel.countDocuments({
      doctor: doctorId
    })

    const appointmentsByStatus = await this.appointmentModel.aggregate([
      { $match: { doctor: new Types.ObjectId(doctorId.toString()) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const revenue = await this.appointmentModel.aggregate([
      {
        $match: {
          doctor: new Types.ObjectId(doctorId.toString()),
          status: AppointmentStatus.Completed
        }
      },
      { $group: { _id: null, total: { $sum: '$appointmentFee' } } }
    ])

    const completedAppointments =
      appointmentsByStatus.find((item) => item._id === AppointmentStatus.Completed)?.count || 0
    const pendingAppointments = appointmentsByStatus.find((item) => item._id === AppointmentStatus.Pending)?.count || 0
    const cancelledAppointments =
      appointmentsByStatus.find((item) => item._id === AppointmentStatus.Cancelled)?.count || 0

    return {
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0
    }
  }

  async getDashboardStatistics() {
    const totalUsers = await this.userModel.countDocuments({ role: Role.User })
    const totalDoctors = await this.userModel.countDocuments({ role: Role.Doctor })
    const totalAppointments = await this.appointmentModel.countDocuments()

    // Get revenue from all completed and confirmed appointments
    const revenue = await this.paymentModel.aggregate([
      {
        $match: {
          status: PaymentStatus.Paid
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_price' }
        }
      }
    ])

    // Calculate package sales
    const packageSales = await this.userPackageModel.aggregate([
      {
        $match: { status: UserPackageStatus.Active }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$price' }
        }
      }
    ])

    // Get appointments by status
    const appointmentsByStatus = await this.appointmentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    // Create a status breakdown object
    const appointmentStatusBreakdown = {}
    appointmentsByStatus.forEach((item) => {
      appointmentStatusBreakdown[item._id] = item.count
    })

    return {
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
      totalPackageSales: packageSales.length > 0 ? packageSales[0].totalSales : 0,
      appointmentStatusBreakdown
    }
  }
}
