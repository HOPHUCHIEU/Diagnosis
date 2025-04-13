import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'apps/api-service/src/account/user/entities/user.entity'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { hashPassword } from 'apps/api-service/src/helper/hash-password.helper'
import { Model } from 'mongoose'
import { Seeder } from 'nestjs-seeder'

@Injectable()
export class UserSeeder implements Seeder {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async seed(): Promise<any> {
    const hashedPassword = await hashPassword('123123')
    const lastLogin = new Date()
    const users = [
      {
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: Role.Admin,
        isVerified: true,
        lastLogin
      },
      {
        email: 'doctor@gmail.com',
        password: hashedPassword,
        role: Role.Doctor,
        isVerified: true,
        lastLogin
      },
      {
        email: 'userTest@gmail.com',
        password: hashedPassword,
        role: Role.User,
        isVerified: true,
        lastLogin
      }
    ]

    return this.userModel.insertMany(users)
  }

  async drop(): Promise<any> {
    return this.userModel.deleteMany({})
  }
}
