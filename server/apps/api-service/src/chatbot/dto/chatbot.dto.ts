import { IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  message: string
}

export class ChatbotResponseDto {
  userId: string
  message: string
}
