import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useVerifyEmailMutation, useResendVerifyEmailMutation } from '@/redux/services/authApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Forward, Loader, RotateCcw, Send, SendToBack, MailCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const createSchema = (t: any) => {
  return yup.object({
    code: yup.string().required(t('auth.verifyEmail.codeRequired')).min(6, t('auth.verifyEmail.codeLength'))
  })
}

export default function VerifyEmail() {
  const { t } = useTranslation('landing')
  const schema = createSchema(t)
  type FormData = yup.InferType<typeof schema>

  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const [countdown, setCountdown] = useState(300)

  const [verifyEmail, verifyResult] = useVerifyEmailMutation()
  const [resendCode, resendResult] = useResendVerifyEmailMutation()

  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: ''
    }
  })

  useEffect(() => {
    if (!email) {
      navigate('/sign-in')
    }
  }, [email, navigate])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onSubmit = (data: FormData) => {
    verifyEmail({ email, code: data.code })
  }

  const handleResendCode = () => {
    resendCode({ email })
    setCountdown(300)
  }

  useEffect(() => {
    if (verifyResult.data) {
      toast.success(CustomNotification, {
        data: {
          title: t('auth.verifyEmail.successTitle', { email }),
          content: t('auth.verifyEmail.successMessage')
        }
      })
      navigate('/sign-in', {
        state: {
          email,
          verified: true // Thêm flag để đánh dấu email đã verify
        }
      })
    }
  }, [verifyResult, email, navigate, t])

  useEffect(() => {
    if (resendResult.data) {
      toast.success(t('auth.verifyEmail.resendSuccess'))
    }
    if (resendResult.error) {
      toast.error(t('auth.verifyEmail.resendError'))
    }
  }, [resendResult, t])

  return (
    <div className='flex justify-center items-center w-full'>
      <div className='flex overflow-hidden relative w-full rounded-lg shadow-lg'>
        <div className='items-center justify-center hidden w-full sm:flex max-h-[80vh]'>
          <img src='./dk.svg' alt='Lab Background' className='object-cover w-full h-full' />
        </div>

        <div className='flex relative justify-center items-center p-10 w-full bg-white shadow-lg'>
          <div className='flex absolute top-6 right-6 items-center space-x-1'>
            <img src='./DAIQ.svg' alt='...' className='w-40 h-10' />
          </div>

          <div className='w-full max-w-md'>
            <div className='mb-6 text-center'>
              <MailCheck className='mx-auto w-12 h-12 text-primary' />
              <h2 className='mt-4 text-2xl font-bold text-center'>{t('auth.verifyEmail.title')}</h2>
              <p className='mt-2 text-center text-gray-600'>
                {t('auth.verifyEmail.description')} <span className='font-medium'>{email}</span>.<br />
                {t('auth.verifyEmail.instruction')}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='space-y-4 w-full text-center'>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className='gap-2 justify-center w-full'>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-center'>
                  <Button
                    type='submit'
                    effect={'ringHover'}
                    className='rounded-full min-w-[120px]'
                    isLoading={verifyResult.isLoading}
                    disabled={verifyResult.isLoading}
                  >
                    {t('auth.verifyEmail.verifyButton')}
                  </Button>
                </div>
              </form>
            </Form>

            <div className='mt-4 text-center'>
              <Button
                className='font-medium'
                onClick={handleResendCode}
                disabled={countdown > 0 || resendResult.isLoading}
                effect={'hoverUnderline'}
                variant='link'
              >
                {countdown > 0
                  ? `${t('auth.verifyEmail.resendCodeTimer')} ${Math.floor(countdown / 60)}:${(countdown % 60)
                      .toString()
                      .padStart(2, '0')}`
                  : t('auth.verifyEmail.resendCode')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
