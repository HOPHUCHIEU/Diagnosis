import { IsNotEmpty, IsString } from 'class-validator'

export class CancelAppointmentDto {
  @IsNotEmpty()
  @IsString()
  cancelReason: string
}
