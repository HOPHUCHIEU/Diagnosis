import React from 'react'
import { Calendar, Video, Stethoscope, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next' // Import useTranslation
interface StepProps {
  number: number
  title: string
  description: string
  icon: React.ElementType
}

const Step = ({ number, title, description, icon: Icon }: StepProps) => {
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
      <h3 className='mb-2 text-xl font-semibold'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  )
}

const HowItWorks = () => {
  const { t } = useTranslation() // Hook để sử dụng i18n

  const steps: StepProps[] = [
    {
      number: 1,
      title: t('howItWorks.step1.title'), // Sử dụng key dịch
      description: t('howItWorks.step1.description'),
      icon: Calendar
    },
    {
      number: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      icon: Video
    },
    {
      number: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      icon: Stethoscope
    },
    {
      number: 4,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      icon: ArrowRight
    }
  ]

  return (
    <section className='py-16 bg-white'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Cách Thức Hoạt Động</h2>
          <p className='text-lg text-gray-600'>
            Quy trình đơn giản để kết nối với bác sĩ và nhận tư vấn y tế chất lượng cao
          </p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <Step key={index} number={step.number} title={step.title} description={step.description} icon={step.icon} />
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
