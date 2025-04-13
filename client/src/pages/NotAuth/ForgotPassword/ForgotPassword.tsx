import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '@/components/Core/Input'
import { useForgotPasswordMutation } from '@/redux/services/authApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Button } from '@/components/ui/button'
import path from '@/constants/path'
import { CheckCircle2, Mail } from 'lucide-react'
import { Schema, schema } from '@/utils/rules'
import { useTranslation } from 'react-i18next'

type ForgotPasswordFormData = Pick<Schema, 'email'>
const forgotPasswordSchema = schema.pick(['email'])

type FormData = yup.InferType<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(forgotPasswordSchema) })

  const onSubmit = handleSubmit(async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email }).unwrap()
      setIsSubmitted(true)
      setSubmittedEmail(data.email)
      toast.success(CustomNotification, {
        data: {
          title: 'Yêu cầu đã được gửi!',
          content: 'Vui lòng kiểm tra email của bạn để tiếp tục quá trình đặt lại mật khẩu.'
        }
      })
    } catch (error) {
      console.log(error)
      if ((error as unknown as { data: { message: string } }).data.message === 'USER_NOT_FOUND') {
        setError('email', {
          message: 'Email không tồn tại',
          type: 'Server'
        })
      }
    }
  })

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
            {!isSubmitted ? (
              <>
                <div className='mb-6 text-center'>
                  <Mail className='mx-auto w-12 h-12 text-primary' />
                  <h2 className='mt-4 text-2xl font-bold text-gray-900'>{t('auth.forgotPassword.title')}</h2>
                  <p className='mt-2 text-sm text-gray-600'>{t('auth.forgotPassword.subtitle')}</p>
                </div>

                <form onSubmit={onSubmit} className='space-y-4'>
                  <Input
                    label={t('auth.forgotPassword.email')}
                    name='email'
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    register={register}
                    type='email'
                    errorMessage={errors.email?.message}
                  />

                  <Button
                    type='submit'
                    className='w-full'
                    effect={'ringHover'}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {t('auth.forgotPassword.sendRequest')}
                  </Button>
                </form>

                <div className='mt-6 text-center'>
                  <Link to={path.signin} className='text-sm text-primary hover:underline'>
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </div>
              </>
            ) : (
              <div className='text-center'>
                <CheckCircle2 className='mx-auto w-14 h-14 text-green-500' />
                <h2 className='mt-4 text-2xl font-bold text-gray-900'>{t('auth.forgotPassword.checkEmail')}</h2>
                <p className='mt-2 text-gray-600'>
                  {t('auth.forgotPassword.emailSent')}
                  <span className='font-semibold'> {submittedEmail}</span>
                </p>
                <p className='mt-4 text-sm text-gray-500'>{t('auth.forgotPassword.noEmail')}</p>
                <div className='mt-6 space-y-3'>
                  <Button variant='outline' className='w-full' onClick={() => setIsSubmitted(false)}>
                    {t('auth.forgotPassword.tryAgain')}
                  </Button>
                  <Button variant='default' className='w-full' onClick={() => navigate(path.signin)}>
                    {t('auth.forgotPassword.backToSignIn')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
