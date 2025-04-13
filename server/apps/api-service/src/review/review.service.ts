import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Review } from 'apps/api-service/src/review/entities/review.entity'
import { Model, Types } from 'mongoose'
import { Appointment } from 'apps/api-service/src/appointment/entities/appointment.entity'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'

@Injectable()
export class ReviewService {
  @InjectModel(Review.name)
  private readonly reviewModel: Model<Review>

  @InjectModel(Appointment.name)
  private readonly appointmentModel: Model<Appointment>

  @InjectModel(DoctorProfile.name)
  private readonly doctorProfileModel: Model<DoctorProfile>

  async create(user: User, createReviewDto: CreateReviewDto) {
    const appointment = await this.appointmentModel.findById(createReviewDto.appointmentId).exec()

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    if (!appointment.isVideoCallEnded) {
      throw new BadRequestException('Cannot review: appointment has not been completed')
    }

    if (appointment.patient.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only review appointments you participated in')
    }

    const existingReview = await this.reviewModel.findOne({ appointment: appointment._id }).exec()
    if (existingReview) {
      throw new BadRequestException('You have already submitted a review for this appointment')
    }

    const review = new this.reviewModel({
      patient: user._id,
      doctor: new Types.ObjectId(appointment.doctor.toString()),
      appointment: appointment._id,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      tags: createReviewDto.tags,
      isVerified: true
    })

    return (await review.save()).toObject()
  }

  async findByDoctor(doctorProfileId: string, page = 1, limit = 10) {
    const doctorProfile = await this.doctorProfileModel.findById(doctorProfileId).exec()
    console.log(doctorProfile)
    const doctorId = new Types.ObjectId(doctorProfile?.doctor.toString())

    const total = await this.reviewModel.countDocuments({
      doctor: doctorId,
      isVisible: true
    })

    const reviews = await this.reviewModel
      .find({
        doctor: doctorId,
        isVisible: true
      })
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()

    // Calculate average rating
    const avgRating = await this.reviewModel.aggregate([
      { $match: { doctor: doctorId, isVisible: true } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ])

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: avgRating.length > 0 ? parseFloat(avgRating[0].average.toFixed(1)) : 0,
        totalReviews: total
      }
    }
  }

  async findByAppointment(appointmentId: string, page = 1, limit = 10) {
    const appointment = await this.appointmentModel.findById(appointmentId)

    if (!appointment) {
      throw new NotFoundException('Appointment not found')
    }

    const total = await this.reviewModel.countDocuments({ appointment: new Types.ObjectId(appointmentId) })

    const reviews = await this.reviewModel
      .find({ appointment: new Types.ObjectId(appointmentId) })
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName specialties'
          }
        },
        {
          path: 'appointment',
          select: 'appointmentDate type'
        }
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async respondToReview(user: User, reviewId: string, response: string) {
    const review = await this.reviewModel.findById(reviewId).exec()

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (user.role !== Role.Admin && review.doctor.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only respond to reviews of your services')
    }

    review.adminReply = response
    review.adminReplyAt = new Date()

    return (await review.save()).toObject()
  }

  async findAll(page = 1, limit = 10, isVisible?: boolean) {
    const filter: any = {}
    if (isVisible !== undefined) {
      filter.isVisible = isVisible
    }

    const total = await this.reviewModel.countDocuments(filter)

    const reviews = await this.reviewModel
      .find(filter)
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName'
          }
        }
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findByPatient(patientId: string, page = 1, limit = 10) {
    const total = await this.reviewModel.countDocuments({ patient: patientId })

    const reviews = await this.reviewModel
      .find({ patient: patientId })
      .populate([
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName fullName specialties'
          }
        },
        {
          path: 'appointment',
          select: 'appointmentDate type'
        }
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async update(user: User, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(updateReviewDto.reviewId).exec()

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (review.patient.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only update your own reviews')
    }

    Object.keys(updateReviewDto).forEach((key) => {
      if (updateReviewDto[key] !== undefined) {
        review[key] = updateReviewDto[key]
      }
    })

    review.updatedAt = new Date()

    return (await review.save()).toObject()
  }

  async remove(user: User, reviewId: string) {
    const review = await this.reviewModel.findById(reviewId).exec()

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (user.role !== Role.Admin && review.patient.toString() !== user._id.toString()) {
      throw new ForbiddenException('You cannot delete this review')
    }

    await this.reviewModel.findByIdAndDelete(reviewId).exec()
    return { message: 'Review deleted successfully' }
  }

  async toggleVisibility(reviewId: string, isVisible: boolean) {
    const review = await this.reviewModel.findByIdAndUpdate(reviewId, { isVisible }, { new: true }).exec()

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    return review.toObject()
  }

  async getReviewAnalytics(user: User, doctorProfileId: string) {
    const doctorProfile = await this.doctorProfileModel.findById(doctorProfileId).exec()
    if (!doctorProfile) {
      throw new NotFoundException('Doctor not found')
    }

    const doctorId = new Types.ObjectId(doctorProfile?.doctor.toString())

    if (user.role === Role.Doctor && user._id.toString() !== doctorProfileId) {
      throw new ForbiddenException('You can only view your own review analytics')
    }

    const basicStats = await this.reviewModel.aggregate([
      { $match: { doctor: new Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          average: { $avg: '$rating' },
          visible: { $sum: { $cond: ['$isVisible', 1, 0] } }
        }
      }
    ])

    // Get rating distribution
    const ratingDistribution = await this.reviewModel.aggregate([
      { $match: { doctor: new Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ])

    // Get tag frequency
    const tagFrequency = await this.reviewModel.aggregate([
      { $match: { doctor: new Types.ObjectId(doctorId) } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Recent review trend by month
    const reviewTrend = await this.reviewModel.aggregate([
      { $match: { doctor: new Types.ObjectId(doctorId) } },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          rating: 1
        }
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ])

    return {
      totalReviews: basicStats.length ? basicStats[0].total : 0,
      averageRating: basicStats.length ? parseFloat(basicStats[0].average.toFixed(1)) : 0,
      visibleReviews: basicStats.length ? basicStats[0].visible : 0,
      ratingDistribution: Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1
        const found = ratingDistribution.find((item) => item._id === rating)
        return { rating, count: found ? found.count : 0 }
      }),
      popularTags: tagFrequency.map((tag) => ({ tag: tag._id, count: tag.count })),
      monthlyTrend: reviewTrend.map((month) => ({
        month: month._id.month,
        year: month._id.year,
        averageRating: parseFloat(month.avgRating.toFixed(1)),
        count: month.count
      }))
    }
  }

  async findOne(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate([
        {
          path: 'patient',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName fullName'
          }
        },
        {
          path: 'doctor',
          select: 'profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName fullName specialties'
          }
        },
        {
          path: 'appointment',
          select: 'appointmentDate type'
        }
      ])
      .lean()
      .exec()

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    return review
  }
}
