import { DayOfWeek, SessionType } from 'apps/api-service/src/work-schedule/work-schedule.enum'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class SessionApprovalDto {
  @IsNotEmpty()
  @IsEnum(SessionType)
  session: SessionType
}
