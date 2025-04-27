import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { ConfigService } from '@nestjs/config'
import { format } from 'date-fns'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Payment } from 'apps/api-service/src/payment/entities/payment.entity'
import { PaymentStatus } from 'apps/api-service/src/payment/payment.enum'
import * as querystring from 'qs'
import * as crypto from 'crypto'
import { AppointmentPackage } from 'apps/api-service/src/appointment-package/entities/appointment-package.entity'
import { UserPackage } from 'apps/api-service/src/appointment-package/entities/user-package.entity'
import { UserPackageStatus } from 'apps/api-service/src/appointment-package/appointment-package.enum'
import { CronExpression } from '@nestjs/schedule'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class PaymentService {
  constructor(private readonly configService: ConfigService) {}

  @InjectModel(Payment.name)
  private readonly paymentModel: Model<Payment>

  @InjectModel(AppointmentPackage.name)
  private readonly appointmentPackageModel: Model<AppointmentPackage>

  @InjectModel(UserPackage.name)
  private readonly userPackageModel: Model<UserPackage>

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleScheduledPaymentCleanup() {
    const cleaned = await this.cleanupAbandonedPayments()
    console.log(cleaned)
  }

  async cleanupAbandonedPayments() {
    const expirationTime = new Date()
    expirationTime.setMinutes(expirationTime.getMinutes() - 30)

    const abandonedPayments = await this.paymentModel.updateMany(
      {
        status: PaymentStatus.Pending,
        createdAt: { $lt: expirationTime }
      },
      {
        $set: {
          status: PaymentStatus.Cancelled,
          error_message: 'Payment session expired or abandoned'
        }
      }
    )

    return `Updated ${abandonedPayments.modifiedCount} abandoned payments`
  }

  async create(user: User, createPaymentDto: CreatePaymentDto, ipAddr: string) {
    try {
      const pendingPayments = await this.paymentModel.find({
        user: user._id,
        status: PaymentStatus.Pending
      })

      if (pendingPayments.length > 0) {
        console.log(`Cancelling ${pendingPayments.length} pending payments for user ${user._id}`)

        await this.paymentModel.updateMany(
          { _id: { $in: pendingPayments.map((payment) => payment._id) } },
          {
            $set: {
              status: PaymentStatus.Cancelled,
              error_message: 'Previous payment cancelled due to new payment request'
            }
          }
        )
      }
      const date = new Date()
      process.env.TZ = 'Asia/Ho_Chi_Minh'
      const createDate = format(date, 'yyyyMMddHHmmss')

      const packageItem = await this.appointmentPackageModel.findById(createPaymentDto.packageId)

      if (!packageItem) {
        throw new NotFoundException('Appointment package not found')
      }

      if (!packageItem.isActive) {
        throw new BadRequestException('Package is not available for purchase')
      }

      const bankCode = createPaymentDto.bankCode
      const locale = createPaymentDto.language || 'vn'

      const tmnCode = this.configService.get('vnp_TmnCode')
      const secretKey = this.configService.get('vnp_HashSecret')
      let vnpUrl = this.configService.get('vnp_Url')
      const returnUrl = this.configService.get('vnp_ReturnUrl')

      const paymentId = new Types.ObjectId().toHexString()
      const currCode = 'VND'

      let vnp_Params: any = {}
      vnp_Params['vnp_Version'] = '2.1.0'
      vnp_Params['vnp_Command'] = 'pay'
      vnp_Params['vnp_TmnCode'] = tmnCode
      vnp_Params['vnp_Locale'] = locale
      vnp_Params['vnp_CurrCode'] = currCode
      vnp_Params['vnp_TxnRef'] = paymentId
      vnp_Params['vnp_OrderInfo'] = `Thanh toan goi ${packageItem.name}`
      vnp_Params['vnp_OrderType'] = 'billpayment'
      vnp_Params['vnp_Amount'] = packageItem.price * 100
      vnp_Params['vnp_ReturnUrl'] = returnUrl
      vnp_Params['vnp_IpAddr'] = ipAddr
      vnp_Params['vnp_CreateDate'] = createDate

      if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode
      }

      const payment = await this.paymentModel.create({
        _id: paymentId,
        package: packageItem._id,
        user: user._id,
        total_price: packageItem.price,
        status: PaymentStatus.Pending,
        payment_date: null,
        bank_code: bankCode ? bankCode : null,
        ip_address: ipAddr
      })

      vnp_Params = this.sortObject(vnp_Params)
      const signData = querystring.stringify(vnp_Params, { encode: false })
      const hmac = crypto.createHmac('sha512', secretKey)
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
      vnp_Params['vnp_SecureHash'] = signed
      vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false })

      return { paymentUrl: vnpUrl }
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.message}`)
    }
  }

  private sortObject(obj: any) {
    const sorted: any = {}
    const str = []
    let key
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key))
      }
    }
    str.sort()
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+')
    }
    return sorted
  }

  async vnpayIPN(payload: querystring.ParsedQs) {
    let vnp_Params = payload
    const secureHash = vnp_Params['vnp_SecureHash']

    const paymentId = vnp_Params['vnp_TxnRef'] as string
    const orderInfo = vnp_Params['vnp_OrderInfo'] as string
    const amount = parseFloat(vnp_Params['vnp_Amount'] as string) / 100
    const rspCode = vnp_Params['vnp_ResponseCode'] as string
    const bankCode = vnp_Params['vnp_BankCode'] as string

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = this.sortObject(vnp_Params)
    const secretKey = this.configService.get('vnp_HashSecret')
    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    const clientUrl = this.configService.get('CLIENT_URL')

    const payment = await this.paymentModel.findById(paymentId)

    if (!payment) {
      return {
        message: 'Order not found',
        RspCode: '99',
        url: clientUrl
      }
    }

    const checkAmount = amount === payment.total_price

    if (secureHash === signed) {
      if (checkAmount) {
        if (payment.status === PaymentStatus.Pending) {
          if (rspCode === '00') {
            await this.paymentModel.findByIdAndUpdate(paymentId, {
              status: PaymentStatus.Paid,
              payment_date: new Date(),
              bank_code: bankCode
            })

            const packageDetails = await this.appointmentPackageModel.findById(payment.package)

            if (!packageDetails) {
              return {
                message: 'Package not found',
                RspCode: '99',
                url: `${clientUrl}/profile?paymentId=${paymentId}`
              }
            }

            const purchaseDate = new Date()
            const expiryDate = new Date()
            expiryDate.setDate(purchaseDate.getDate() + packageDetails.validityPeriod)

            await this.userPackageModel.create({
              user: payment.user,
              package: payment.package,
              remainingAppointments: packageDetails.appointmentCount,
              totalAppointments: 0,
              purchaseDate: purchaseDate,
              expiryDate: expiryDate,
              status: UserPackageStatus.Active,
              payment: paymentId
            })

            return {
              message: 'success',
              RspCode: '00',
              url: `${clientUrl}/profile?paymentId=${paymentId}`
            }
          } else {
            await this.paymentModel.findByIdAndUpdate(paymentId, {
              status: PaymentStatus.Failed
            })

            return {
              message: 'Payment failed',
              RspCode: rspCode,
              url: `${clientUrl}/profile?paymentId=${paymentId}`
            }
          }
        } else {
          if (payment) {
            await this.paymentModel.findByIdAndUpdate(paymentId, {
              status: PaymentStatus.Failed
            })
          }
          return {
            message: 'This payment has already been processed',
            RspCode: '02',
            url: `${clientUrl}/profile?paymentId=${paymentId}`
          }
        }
      } else {
        await this.paymentModel.findByIdAndUpdate(paymentId, {
          status: PaymentStatus.Failed
        })
        return {
          message: 'Amount mismatch',
          RspCode: '04',
          url: `${clientUrl}/profile?paymentId=${paymentId}`
        }
      }
    } else {
      if (payment) {
        await this.paymentModel.findByIdAndUpdate(paymentId, {
          status: PaymentStatus.Failed
        })
      }
      return {
        message: 'Invalid signature',
        RspCode: '97',
        url: `${clientUrl}/profile?paymentId=${paymentId}`
      }
    }
  }

  async findAll() {
    return await this.paymentModel
      .find()
      .populate([
        {
          path: 'package',
          select: 'name description appointmentCount price isActive validityPeriod features'
        },
        {
          path: 'user',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()
  }

  async findMyPayments(user: User) {
    return await this.paymentModel
      .find({ user: user._id })
      .populate([
        {
          path: 'package',
          select: 'name description appointmentCount price isActive validityPeriod features'
        }
      ])
      .lean()
      .exec()
  }

  async findOne(id: string) {
    return await this.paymentModel
      .findById(id)
      .populate([
        {
          path: 'package',
          select: 'name description appointmentCount price isActive validityPeriod features'
        },
        {
          path: 'user',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .lean()
      .exec()
  }
}
