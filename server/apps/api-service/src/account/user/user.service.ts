import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { UserProfile } from 'apps/api-service/src/account/user-profile/entities/user-profile.entity'
import { AdminCreateUserDto } from 'apps/api-service/src/account/user/dto/admin-create-user.dto'
import { CreateUserDto } from 'apps/api-service/src/account/user/dto/create-user.dto'
import { UpdateProfileDto } from 'apps/api-service/src/account/user/dto/update-profile.dto'
import { UpdateUserDto } from 'apps/api-service/src/account/user/dto/update-user.dto'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { Address } from 'apps/api-service/src/account/address/entities/address.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { hashPassword } from 'apps/api-service/src/helper/hash-password.helper'
import { Model, Types } from 'mongoose'
import { DoctorProfile } from 'apps/api-service/src/account/doctor-profile/entities/doctor-profile.entity'
import { PatientRecord } from 'apps/api-service/src/patient-record/entities/patient-record.entity'

@Injectable()
export class UserService {
  @InjectModel(User.name)
  private readonly userModel: Model<User>

  @InjectModel(UserProfile.name)
  private readonly userProfileModel: Model<UserProfile>

  @InjectModel(Address.name)
  private readonly addressModel: Model<Address>

  @InjectModel(DoctorProfile.name)
  private readonly doctorProfileModel: Model<DoctorProfile>

  @InjectModel(PatientRecord.name)
  private readonly patientRecordModel: Model<PatientRecord>

  async getUserById({ id }: { id: string }): Promise<User> {
    const user = await this.userModel.findById(id).populate('profile', 'address').exec()
    return user
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email })
    if (!user) throw new NotFoundException('USER_NOT_FOUND')
    return user
  }

  async updateLastLoginToNow(user: User) {
    await this.userModel.updateOne({ _id: user._id }, { lastLogin: new Date() })
  }

  async handleRegister({
    createUserDto,
    invitationCode,
    invitationCodeExpired
  }: {
    createUserDto: CreateUserDto
    invitationCode: string
    invitationCodeExpired: Date
  }) {
    const { email, password, firstName, lastName, phone } = createUserDto
    const isEmailExist = await this.userModel.findOne({ email }).exec()

    if (isEmailExist) throw new ConflictException('EMAIL_ALREADY_EXISTS')

    const userProfile = new this.userProfileModel({
      firstName,
      lastName,
      phone
    })
    await userProfile.save()

    const hashedPassword = await hashPassword(password)

    const user = await new this.userModel({
      email,
      password: hashedPassword,
      profile: userProfile._id,
      invitationCode,
      invitationCodeExpired,
      role: Role.User
    }).save()

    return user
  }

  async updateUser(user: User, data: Partial<User>): Promise<User> {
    const { password, email, role, ...updateData } = data
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: user._id }, { $set: updateData }, { new: true })
      .populate('profile')
      .exec()

    return updatedUser
  }

  async updatePassword(user: User, password: string): Promise<User> {
    const hashedPassword = await hashPassword(password)
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        { $set: { password: hashedPassword, confirmationCode: null, confirmationCodeExpired: null } },
        { new: true }
      )
      .populate('profile')
      .exec()

    return updatedUser
  }

  async findAll(user: User) {
    const users = await this.userModel
      .find({ _id: { $ne: user._id } })
      .populate('profile', '-__v')
      .select('-password -confirmationCode -confirmationCodeExpired -__v')
      .lean()
      .exec()

    const doctorProfiles = await this.doctorProfileModel.find().lean().exec()
    const patientRecords = await this.patientRecordModel.find().lean().exec()

    const usersWithExtendedInfo = users.map((user) => {
      const doctorProfile = doctorProfiles.find(
        (profile) => profile.doctor && profile.doctor.toString() === user._id.toString()
      )

      const patientRecord = patientRecords.find(
        (profile) => profile.patient && profile.patient.toString() === user._id.toString()
      )

      return {
        ...user,
        doctorProfileId: doctorProfile ? doctorProfile._id : null,
        patientId: patientRecord ? patientRecord._id : null
      }
    })

    return usersWithExtendedInfo
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).populate('profile', '-__v').select('-password -__v').lean().exec()
    return user
  }

  async create(createUserDto: AdminCreateUserDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      street,
      ward,
      district,
      province,
      isVerified = true
    } = createUserDto
    const isEmailExist = await this.userModel.findOne({ email }).exec()

    if (isEmailExist) throw new ConflictException('EMAIL_ALREADY_EXISTS')

    let addressId = null
    if (street || ward || district || province) {
      const newAddress = await new this.addressModel({
        street,
        ward,
        district,
        province
      }).save()
      addressId = newAddress._id
    }

    const userProfile = new this.userProfileModel({
      firstName,
      lastName,
      phone,
      ...(addressId && { address: addressId })
    })
    await userProfile.save()

    const hashedPassword = await hashPassword(password)

    const user = await new this.userModel({
      email,
      password: hashedPassword,
      profile: userProfile._id,
      role: role && role !== Role.Admin ? role : Role.User,
      isVerified: isVerified
    }).save()

    return user.toObject()
  }

  async update(updateUserDto: UpdateUserDto) {
    const {
      id,
      role,
      firstName,
      lastName,
      phone,
      gender,
      birth,
      disabled,
      avatar,
      street,
      ward,
      district,
      province,
      isVerified
    } = updateUserDto
    const existingUser = await this.userModel.findById(id).exec()
    if (!existingUser) {
      throw new NotFoundException('USER_NOT_FOUND')
    }

    if (existingUser.role === Role.Admin && role !== Role.Admin) {
      throw new ConflictException('CANNOT_CHANGE_ADMIN_ROLE')
    }

    let addressId = null
    if (street || ward || district || province) {
      if (existingUser.profile) {
        const existingProfile = await this.userProfileModel.findById(existingUser.profile)
        if (existingProfile.address) {
          await this.addressModel.findByIdAndUpdate(existingProfile.address, {
            street,
            ward,
            district,
            province
          })
          addressId = existingProfile.address
        } else {
          const newAddress = await new this.addressModel({
            street,
            ward,
            district,
            province
          }).save()
          addressId = newAddress._id
        }
      } else {
        const newAddress = await new this.addressModel({
          street,
          ward,
          district,
          province
        }).save()
        addressId = newAddress._id
      }
    }

    if (firstName || lastName || phone || gender || birth || avatar) {
      if (!existingUser.profile) {
        const newProfile = await new this.userProfileModel({
          firstName,
          lastName,
          phone,
          gender,
          birth: birth ? new Date(birth) : null,
          avatar,
          ...(addressId && { address: addressId })
        }).save()

        await this.userModel.findByIdAndUpdate(id, { profile: newProfile._id })
      } else {
        await this.userProfileModel.findByIdAndUpdate(
          existingUser.profile,
          {
            $set: {
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(phone && { phone }),
              ...(gender && { gender }),
              ...(birth && { birth: new Date(birth) }),
              ...(avatar && { avatar }),
              ...(addressId && { address: addressId })
            }
          },
          { new: true, upsert: true }
        )
      }
    }

    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: id },
        {
          $set: {
            ...(disabled !== undefined && { disabled }),
            ...(isVerified !== undefined && { isVerified }),
            ...(role && { role: role !== Role.Admin ? role : Role.User })
          }
        },
        { new: true }
      )
      .populate('profile')
      .exec()

    return updatedUser.toObject()
  }

  async getProfile(user: User) {
    // Lấy thông tin người dùng với profile và address
    const userData = await this.userModel
      .findById(user._id)
      .select('-password -confirmationCode -confirmationCodeExpired -__v')
      .populate('profile')
      .populate({
        path: 'profile',
        populate: {
          path: 'address'
        }
      })
      .lean()
      .exec()

    // Chuẩn bị kết quả trả về với fullName
    let result: any = userData
    if (userData && userData.profile && typeof userData.profile === 'object' && 'firstName' in userData.profile) {
      result = {
        ...userData,
        profile: {
          ...(userData.profile as any),
          fullName: `${(userData.profile as any).firstName || ''} ${(userData.profile as any).lastName || ''}`.trim()
        }
      }
    }

    // Nếu là bác sĩ, tìm và thêm thông tin doctor profile
    if (userData && userData.role === Role.Doctor) {
      const doctorProfile = await this.doctorProfileModel.findOne({ doctor: user._id.toString() }).lean().exec()

      if (doctorProfile) {
        result = {
          ...result,
          doctorProfileId: doctorProfile ? doctorProfile._id : null
        }
      }
    }

    const patientRecord = await this.patientRecordModel.findOne({ patient: user._id.toString() }).lean().exec()

    if (patientRecord) {
      result = {
        ...result,
        patientId: patientRecord._id
      }
    }

    return result
  }

  async delete(id: string) {
    const user = await this.userModel.findById(id).exec()
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND')
    }
    if (user.profile) {
      const profile = await this.userProfileModel.findById(user.profile).exec()
      if (profile.address) {
        await this.addressModel.findByIdAndDelete(profile.address).exec()
      }
      await this.userProfileModel.findByIdAndDelete(user.profile).exec()
    }
    await this.userModel.findByIdAndDelete(id).exec()
    return { message: 'User deleted successfully' }
  }

  async updateProfile(user: User, updateProfileDto: UpdateProfileDto) {
    const { firstName, lastName, phone, gender, birth, avatar, address, street, ward, district, province } =
      updateProfileDto
    let addressId = null
    if (street || ward || district || province) {
      if (user.profile) {
        const existingProfile = await this.userProfileModel.findById(user.profile)
        if (existingProfile.address) {
          await this.addressModel.findByIdAndUpdate(existingProfile.address, {
            street,
            ward,
            district,
            province
          })
          addressId = existingProfile.address
        } else {
          const newAddress = await new this.addressModel({
            street,
            ward,
            district,
            province
          }).save()
          addressId = newAddress._id
        }
      } else {
        const newAddress = await new this.addressModel({
          street,
          ward,
          district,
          province
        }).save()
        addressId = newAddress._id
      }
    }

    if (!user.profile) {
      const newProfile = await new this.userProfileModel({
        firstName,
        lastName,
        phone,
        gender,
        birth: birth ? new Date(birth) : null,
        avatar,
        address: addressId
      }).save()

      await this.userModel.findByIdAndUpdate(user._id, { profile: newProfile._id })
      return newProfile.toObject()
    }

    const updatedProfile = await this.userProfileModel
      .findByIdAndUpdate(
        user.profile,
        {
          $set: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(gender && { gender }),
            ...(birth && { birth: new Date(birth) }),
            ...(avatar && { avatar }),
            ...(addressId && { address: addressId })
          }
        },
        { new: true, upsert: true }
      )
      .populate('address')
      .lean()
      .exec()

    return updatedProfile
  }
}
