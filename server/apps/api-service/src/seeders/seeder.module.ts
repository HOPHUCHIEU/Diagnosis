import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSeeder } from './user.seeder'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])]
})
export class SeederModule {}
