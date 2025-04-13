import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { CreatePatientRecordDto } from './dto/create-patient-record.dto'
import { UpdatePatientRecordDto } from './dto/update-patient-record.dto'
import { PatientRecord } from 'apps/api-service/src/patient-record/entities/patient-record.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'

@Injectable()
export class PatientRecordService {
  @InjectModel(PatientRecord.name)
  private readonly patientRecordModel: Model<PatientRecord>

  @InjectModel(User.name)
  private readonly userModel: Model<User>

  async create(user: User, createPatientRecordDto: CreatePatientRecordDto) {
    if (user.role === Role.User && createPatientRecordDto.patient !== user._id.toString()) {
      throw new BadRequestException('Access denied')
    }
    const { patient } = createPatientRecordDto

    const userExists = await this.userModel.exists({ _id: patient })
    if (!userExists) {
      throw new BadRequestException('User not found')
    }

    const existingRecord = await this.patientRecordModel.findOne({ patient })
    if (existingRecord) {
      throw new ConflictException('Patient record already exists')
    }

    const newPatientRecord = new this.patientRecordModel(createPatientRecordDto)
    return (await newPatientRecord.save()).toObject()
  }

  async findAll(query: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query
    const skip = (page - 1) * limit
    const filter: any = {}

    if (search) {
      const patients = await this.userModel
        .find({
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        })
        .select('_id')
        .lean()

      const patientIds = patients.map((user) => user._id)
      if (patientIds.length > 0) {
        filter.patient = { $in: patientIds }
      } else {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }
    }

    const total = await this.patientRecordModel.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const records = await this.patientRecordModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('patient', 'firstName lastName email')
      .lean()

    return {
      data: records,
      total,
      page,
      limit,
      totalPages
    }
  }

  async findOne(user: User, id: string) {
    const record = await this.patientRecordModel
      .findById(id)
      .populate({
        path: 'patient',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'fullName'
        }
      })
      .lean({ virtuals: true })

    if (!record) {
      throw new NotFoundException('Patient record not found')
    }

    if (user.role === Role.User) {
      const patientId = record.patient._id ? record.patient._id.toString() : record.patient.toString()
      if (patientId !== user._id.toString()) {
        throw new BadRequestException('Access denied')
      }
    }

    return record
  }

  async findByPatientId(patientId: string) {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('ID is invalid')
    }

    const record = await this.patientRecordModel
      .findById(patientId)
      .populate({
        path: 'patient',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'fullName'
        }
      })
      .lean({ virtuals: true })

    if (!record) {
      throw new NotFoundException('Patient record not found')
    }

    return record
  }

  async update(user: User, updatePatientRecordDto: UpdatePatientRecordDto) {
    const { patient, ...recordData } = updatePatientRecordDto

    const p = await this.userModel.findById(patient).exec()
    if (!p) {
      throw new NotFoundException('Patient not found')
    }

    const record = await this.patientRecordModel.findOne({ patient: patient }).exec()
    if (!record) {
      throw new NotFoundException('Patient record not found')
    }

    if (user.role === Role.User) {
      if (record.patient.toString() !== user._id.toString()) {
        throw new BadRequestException('Access denied')
      }
    }

    if (patient && patient !== record.patient.toString()) {
      throw new BadRequestException('Patient ID cannot be changed')
    }

    const updatedRecord = await this.patientRecordModel
      .findOneAndUpdate({ patient: patient }, updatePatientRecordDto, { new: true })
      .populate({
        path: 'patient',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'fullName'
        }
      })
      .lean({ virtuals: true })

    if (!updatedRecord) {
      throw new NotFoundException('Patient record not found')
    }

    return updatedRecord
  }

  async remove(id: string) {
    const patientRecord = await this.patientRecordModel.findByIdAndDelete(id).exec()
    if (!patientRecord) {
      throw new NotFoundException('Patient record not found')
    }
    return { message: 'Patient record deleted successfully' }
  }
}
