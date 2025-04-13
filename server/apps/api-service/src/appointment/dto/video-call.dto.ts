import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { VideoProvider } from '../appointment.enum'

export class VideoCallDto {
  @IsNotEmpty()
  @IsEnum(VideoProvider)
  provider: VideoProvider

  @IsNotEmpty()
  @IsString()
  meetingUrl: string

  @IsOptional()
  @IsString()
  meetingId?: string

  @IsOptional()
  @IsString()
  password?: string
}
