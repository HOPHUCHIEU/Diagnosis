import React from 'react'
import { Calendar, Video, Stethoscope, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StepProps {
  number: number
  stepKey: string
  icon: React.ElementType
}

const Step = ({ number, stepKey, icon: Icon }: StepProps) => {
  const { t } = useTranslation('landing')
  return (
    <div className='flex flex-col items-center p-6 text-center'>
      <div className='relative'>
        <div className='flex justify-center items-center mb-4 w-16 h-16 rounded-full bg-primary/10'>
          <Icon className='w-8 h-8 text-primary' />
        </div>
        <div className='flex absolute -top-2 -right-2 justify-center items-center w-8 h-8 text-white rounded-full bg-primary'>
          {number}
        </div>
      </div>
      <h3 className='mb-2 text-xl font-semibold'>{t(`howItWorks.steps.step${number}.title`)}</h3>
      <p className='text-gray-600'>{t(`howItWorks.steps.step${number}.description`)}</p>
    </div>
  )
}

const HowItWorks = () => {
  const { t } = useTranslation('landing')
  const steps = [
    {
      number: 1,
      stepKey: 'step1',
      icon: Calendar
    },
    {
      number: 2,
      stepKey: 'step2',
      icon: Video
    },
    {
      number: 3,
      stepKey: 'step3',
      icon: Stethoscope
    },
    {
      number: 4,
      stepKey: 'step4',
      icon: ArrowRight
    }
  ]

  return (
    <section className='py-16 bg-white'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>{t('howItWorks.title')}</h2>
          <p className='text-lg text-gray-600'>{t('howItWorks.subtitle')}</p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step) => (
            <Step key={step.number} {...step} />
          ))}
        </div>

        <div className='flex justify-center mt-12'>
          <div className='relative w-3/4 h-1 bg-gray-200 rounded-full md:hidden'></div>
          <div className='hidden relative w-3/4 h-1 bg-gray-200 rounded-full md:block'>
            <div className='absolute top-0 left-0 w-1/4 h-1 rounded-full bg-primary'></div>
            <div className='absolute top-0 left-1/4 w-1/4 h-1 rounded-full bg-primary'></div>
            <div className='absolute top-0 left-2/4 w-1/4 h-1 rounded-full bg-primary'></div>
            <div className='absolute top-0 left-3/4 w-1/4 h-1 rounded-full bg-primary'></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
