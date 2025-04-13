import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto'
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto'
import { InjectModel } from '@nestjs/mongoose'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { Model } from 'mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'

@Injectable()
export class DoctorProfileService {
  @InjectModel(DoctorProfile.name)
  private readonly doctorProfileModel: Model<DoctorProfile>

  @InjectModel(User.name)
  private readonly userModel: Model<User>

  async create(createDoctorProfileDto: CreateDoctorProfileDto) {
    const { doctorId, ...profileData } = createDoctorProfileDto
    const doctor = await this.userModel.findById(doctorId).exec()
    if (!doctor) {
      throw new NotFoundException('Doctor not found')
    }
    if (doctor.role !== Role.Doctor) {
      throw new NotFoundException('User is not a doctor')
    }

    const existingProfile = await this.doctorProfileModel.findOne({ doctor: doctorId }).exec()
    if (existingProfile) {
      throw new BadRequestException('Doctor profile already exists')
    }

    const doctorProfile = new this.doctorProfileModel({
      doctor: doctorId,
      ...profileData
    })
    return (await doctorProfile.save()).toObject()
  }

  async findAll(
    query: {
      page?: number
      limit?: number
      specialties?: string[]
      isAvailable?: boolean
      search?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ) {
    const { page = 1, limit = 10, specialties, isAvailable, search, sortBy = 'createdAt', sortOrder = 'desc' } = query

    const skip = (page - 1) * limit
    const filter: any = {}

    // Thêm điều kiện lọc theo chuyên khoa
    if (specialties && specialties.length > 0) {
      filter.specialties = { $in: specialties }
    }

    // Lọc theo trạng thái làm việc
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable
    }

    if (search) {
      // Lấy danh sách ID của các bác sĩ thỏa mãn điều kiện tìm kiếm
      const doctors = await this.userModel
        .find({
          role: Role.Doctor,
          $or: [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }]
        })
        .select('_id')
        .exec()

      const doctorIds = doctors.map((doctor) => doctor._id)
      if (doctorIds.length > 0) {
        filter.doctor = { $in: doctorIds }
      } else {
        // Nếu không tìm thấy bác sĩ nào, trả về mảng rỗng
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }
    }

    // Tính tổng số bản ghi
    const total = await this.doctorProfileModel.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    // Xây dựng pipeline sort
    const sortOption: any = {}
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Truy vấn dữ liệu với các điều kiện
    const doctorProfiles = await this.doctorProfileModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'doctor',
        select: 'email role isVerified profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName avatar birth gender phone address fullName',
          populate: {
            path: 'address',
            select: 'street district city province country postalCode'
          }
        }
      })
      .lean()
      .exec()

    return {
      data: doctorProfiles,
      total,
      page,
      limit,
      totalPages
    }
  }

  async findAllSpecialties(
    query: {
      doctorId?: string
      page?: number
      limit?: number
      search?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ) {
    const { doctorId, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query
    if (doctorId) {
      const doctorProfile = await this.doctorProfileModel.findOne({ doctor: doctorId }).lean().exec()
      if (!doctorProfile) {
        throw new NotFoundException('Doctor profile not found')
      }
      return {
        data: doctorProfile.specialties,
        total: doctorProfile.specialties.length,
        page: 1,
        limit: doctorProfile.specialties.length,
        totalPages: 1
      }
    }
  }

  async findOne(id: string) {
    const doctorProfile = await this.doctorProfileModel
      .findById(id)
      .populate({
        path: 'doctor',
        select: 'email role isVerified profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName avatar birth gender phone address fullName',
          populate: {
            path: 'address',
            select: 'street district city province country postalCode'
          }
        }
      })
      .lean()
      .exec()
    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found')
    }
    return doctorProfile
  }

  async update(user: User, updateDoctorProfileDto: UpdateDoctorProfileDto) {
    const { doctorId, ...profileData } = updateDoctorProfileDto

    if (user.role === Role.Doctor && user._id.toString() !== doctorId) {
      throw new BadRequestException('You can only update your own profile')
    }

    const doctor = await this.userModel.findById(doctorId).exec()
    if (!doctor) {
      throw new NotFoundException('Doctor not found')
    }

    if (doctor.role !== Role.Doctor) {
      throw new NotFoundException('User is not a doctor')
    }

    const doctorProfile = await this.doctorProfileModel
      .findOneAndUpdate({ doctor: doctorId }, { ...profileData }, { new: true })
      .lean()
      .exec()

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found')
    }

    return doctorProfile
  }

  async remove(id: string) {
    const doctorProfile = await this.doctorProfileModel.findByIdAndDelete(id).exec()
    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found')
    }
    return { message: 'Doctor profile deleted successfully' }
  }
}
