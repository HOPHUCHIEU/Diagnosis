import React from 'react'
import { Heart, Brain, Eye, Shield, Stethoscope, Thermometer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ServiceCard = ({ serviceKey, icon: Icon }: { serviceKey: string; icon: React.ElementType }) => {
  const { t } = useTranslation('landing')
  return (
    <div className='p-6 bg-white rounded-lg border border-gray-100 shadow-md transition-shadow hover:shadow-lg'>
      <div className='flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-primary/10'>
        <Icon className='w-6 h-6 text-primary' />
      </div>
      <h3 className='mb-2 text-xl font-semibold'>{t(`services.items.${serviceKey}.title`)}</h3>
      <p className='text-gray-600'>{t(`services.items.${serviceKey}.description`)}</p>
    </div>
  )
}

const Services = () => {
  const { t } = useTranslation('landing')
  const services = [
    {
      key: 'cardiology',
      icon: Heart
    },
    {
      key: 'general',
      icon: Stethoscope
    },
    {
      key: 'neurology',
      icon: Brain
    },
    {
      key: 'ophthalmology',
      icon: Eye
    },
    {
      key: 'immunology',
      icon: Shield
    },
    {
      key: 'pediatrics',
      icon: Thermometer
    }
  ]

  return (
    <section className='py-16'>
      <div className='container px-4 mx-auto'>
        <div className='mx-auto mb-12 max-w-2xl text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>{t('services.title')}</h2>
          <p className='text-lg text-gray-600'>{t('services.subtitle')}</p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {services.map((service) => (
            <ServiceCard key={service.key} serviceKey={service.key} icon={service.icon} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
