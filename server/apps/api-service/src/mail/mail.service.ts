import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { baseTemplate } from 'apps/api-service/src/mail/templates/base'
import { confirmationCodeTemplate } from 'apps/api-service/src/mail/templates/confirmation-code'
import { notificationTemplate } from 'apps/api-service/src/mail/templates/notification'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Mã xác thực`,
      html: baseTemplate(
        'Mã xác thực',
        confirmationCodeTemplate('Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu của bạn', email, code)
      )
    })
  }

  async sendTemporaryPassword(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Mật khẩu tạm thời`,
      html: baseTemplate(
        'Mật khẩu tạm thời',
        confirmationCodeTemplate(
          'Chúng tôi đã nhận được yêu cầu thay đổi mật khẩu của bạn, đây là mật khẩu mới của bạn',
          email,
          code
        )
      )
    })
  }

  async sendInviteCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Mã kích hoạt tài khoản`,
      html: baseTemplate(
        'Mã kích hoạt tài khoản',
        confirmationCodeTemplate('Chúng tôi đã nhận được yêu cầu xác thực email của bạn', email, code)
      )
    })
  }

  async sendNotification(email: string, subject: string, message: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      html: baseTemplate('Mã kích hoạt tài khoản', notificationTemplate(subject, message))
    })
  }
}
