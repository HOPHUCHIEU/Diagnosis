import { config } from 'dotenv'
import { seeder } from 'nestjs-seeder'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'apps/api-service/src/account/user/entities/user.entity'
import { UserSeeder } from 'apps/api-service/src/seeders/user.seeder'

config()

seeder({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/clinic'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ]
}).run([UserSeeder])
