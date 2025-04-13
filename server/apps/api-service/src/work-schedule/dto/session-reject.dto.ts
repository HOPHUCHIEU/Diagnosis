import { SessionApprovalDto } from 'apps/api-service/src/work-schedule/dto/session-approval.dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class SessionRejectionDto extends SessionApprovalDto {
  @IsNotEmpty()
  @IsString()
  rejectionReason: string
}
