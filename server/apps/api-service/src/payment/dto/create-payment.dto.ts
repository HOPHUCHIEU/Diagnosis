import { PaymentLanguage, PaymentMethod } from 'apps/api-service/src/payment/payment.enum'
import { Type } from 'class-transformer'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class CreatePaymentDto {
  @IsString()
  packageId: string

  @IsOptional()
  @IsEnum(PaymentMethod)
  bankCode: PaymentMethod

  @IsEnum(PaymentLanguage)
  language: PaymentLanguage
}
