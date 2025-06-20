import { Module } from '@nestjs/common'
import { AddressService } from './address.service'
import { AddressController } from './address.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Address, AddressSchema } from 'apps/api-service/src/account/address/entities/address.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }])],
  controllers: [AddressController],
  providers: [AddressService]
})
export class AddressModule {}
