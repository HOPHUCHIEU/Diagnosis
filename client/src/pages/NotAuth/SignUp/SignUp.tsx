import Input from '@/components/Core/Input'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Button } from '@/components/ui/button'
import path from '@/constants/path'
import { useRegisterAccountMutation } from '@/redux/services/authApi'
import { Schema, schema } from '@/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

type FormData = Pick<Schema, 'email' | 'password' | 'confirm_password' | 'firstName' | 'lastName' | 'phone'>
const registerSchema = schema.pick(['email', 'password', 'confirm_password', 'firstName', 'lastName', 'phone'])

export default function SignUp() {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()
  const [registerAccount, resultRegister] = useRegisterAccountMutation()

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(registerSchema) })

  const onSubmit = handleSubmit((data: FormData) => {
    registerAccount({
      lastName: data.lastName,
      firstName: data.firstName,
      email: data.email,
      phone: data.phone,
      password: data.password
    })
  })

  useEffect(() => {
    if (resultRegister.data) {
      // After successful registration, navigate to email verification
      navigate('/verify-email', {
        state: {
          email: getValues('email')
        }
      })
    }
    if (resultRegister.error) {
      const formError = (resultRegister.error as any)?.data?.message || resultRegister.error
      if (formError) {
        if (formError === 'EMAIL_ALREADY_EXISTS') {
          setError('email', {
            message: 'Email đã tồn tại',
            type: 'Server'
          })
        } else if (formError === 'PHONE_ALREADY_EXISTS') {
          setError('phone', {
            message: 'Số điện thoại đã được sử dụng',
            type: 'Server'
          })
        }
      }
    }
    console.log('resultRegister=>', resultRegister)
  }, [resultRegister])

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
            <h2 className='mt-5 mb-6 text-3xl font-bold text-center text-gray-900'>{t('auth.signUp.title')}</h2>
            <p className='mb-6 text-sm font-semibold text-center text-gray-600'>{t('auth.signUp.subtitle')}</p>

            <form onSubmit={onSubmit} className='space-y-4'>
              <Input
                label={t('auth.signUp.email')}
                name='email'
                placeholder='Email'
                register={register}
                type='email'
                errorMessage={errors.email?.message}
              />
              <Input
                label={t('auth.signUp.phone')}
                name='phone'
                placeholder={t('auth.signUp.phone')}
                register={register}
                type='phone'
                errorMessage={errors.phone?.message}
              />
              <div className='grid grid-cols-2 gap-x-4'>
                <Input
                  label={t('auth.signUp.firstName')}
                  name='firstName'
                  placeholder={t('auth.signUp.firstName')}
                  register={register}
                  errorMessage={errors.firstName?.message}
                />
                <Input
                  label={t('auth.signUp.lastName')}
                  name='lastName'
                  placeholder={t('auth.signUp.lastName')}
                  register={register}
                  errorMessage={errors.lastName?.message}
                />
              </div>
              <div className='grid grid-cols-2 gap-x-4'>
                <Input
                  label={t('auth.signUp.password')}
                  name='password'
                  placeholder={t('auth.signUp.password')}
                  register={register}
                  type='password'
                  errorMessage={errors.password?.message}
                  autoComplete='on'
                />
                <Input
                  label={t('auth.signUp.confirmPassword')}
                  name='confirm_password'
                  placeholder={t('auth.signUp.confirmPassword')}
                  register={register}
                  type='password'
                  autoComplete='on'
                  errorMessage={errors.confirm_password?.message}
                />
              </div>
              <Button
                type='submit'
                className='w-full'
                effect={'ringHover'}
                isLoading={resultRegister.isLoading}
                disabled={resultRegister.isLoading}
              >
                {t('auth.signUp.register')}
              </Button>
            </form>
            <p className='mt-4 text-center text-gray-600'>
              {t('auth.signUp.haveAccount')}
              <Button
                variant='link'
                className='px-0 py-0 pl-1 text-sm hover:underline h-fit text-primary'
                onClick={() => navigate(path.signin)}
              >
                {t('auth.signUp.signIn')}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
