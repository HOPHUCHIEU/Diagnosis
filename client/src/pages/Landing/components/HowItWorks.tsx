import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    stepKey: 'step1',
    image: '/landing/appointment.svg'
  },
  {
    stepKey: 'step2',
    image: '/landing/tele.svg'
  },
  {
    stepKey: 'step3',
    image: '/landing/dashboard.svg'
  },
  {
    stepKey: 'step4',
    image: '/landing/quick_consultant.svg'
  }
] as const

export default function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>{t('howItWorks.title')}</h2>
          <p className='text-gray-600'>{t('howItWorks.subtitle')}</p>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {steps.map((step) => (
            <Card key={step.stepKey} className='hover:shadow-lg transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex flex-col items-center'>
                  <img
                    src={step.image}
                    alt={t(`howItWorks.steps.${step.stepKey}.title`)}
                    className='w-24 h-24 mb-4'
                  />
                  <h3 className='text-xl font-semibold mb-2'>
                    {t(`howItWorks.steps.${step.stepKey}.title`)}
                  </h3>
                  <p className='text-gray-600 text-center'>
                    {t(`howItWorks.steps.${step.stepKey}.description`)}
                  </p>
                </div>
              </CardContent>
            </Card>
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

