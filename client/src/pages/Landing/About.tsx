import { useTranslation } from 'react-i18next'
import { Building2, Heart, Stethoscope, Users2, Clock, Shield } from 'lucide-react'

type FeatureKey = 'experts' | 'availability' | 'ai' | 'patientCare' | 'facilities' | 'compassion'
type StatKey = 'patients' | 'experts' | 'support' | 'satisfaction'

const features = [
  {
    icon: Stethoscope,
    key: 'experts' as FeatureKey
  },
  {
    icon: Clock,
    key: 'availability' as FeatureKey
  },
  {
    icon: Shield,
    key: 'ai' as FeatureKey
  },
  {
    icon: Users2,
    key: 'patientCare' as FeatureKey
  },
  {
    icon: Building2,
    key: 'facilities' as FeatureKey
  },
  {
    icon: Heart,
    key: 'compassion' as FeatureKey
  }
] as const

const stats = [
  {
    value: '10k+',
    key: 'patients' as StatKey
  },
  {
    value: '100+',
    key: 'experts' as StatKey
  },
  {
    value: '24/7',
    key: 'support' as StatKey
  },
  {
    value: '95%',
    key: 'satisfaction' as StatKey
  }
] as const

export default function About() {
  const { t } = useTranslation('landing')

  return (
    <div className='w-full min-h-screen bg-white'>
      {/* Hero Section */}
      <div className='relative bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24'>
        <div className='container px-4 mx-auto max-w-7xl'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              {t('about.title')} <span className='text-blue-600'>DiagnosisIQ</span>
            </h1>
            <p className='max-w-2xl mx-auto mt-6 text-lg text-gray-600'>
              {t('about.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className='py-16 bg-white'>
        <div className='container px-4 mx-auto max-w-7xl'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-gray-900'>{t('about.mission.title')}</h2>
            <p className='max-w-2xl mx-auto mt-4 text-gray-600'>
              {t('about.mission.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className='py-16 bg-gray-50'>
        <div className='container px-4 mx-auto max-w-7xl'>
          <h2 className='mb-12 text-3xl font-bold text-center text-gray-900'>{t('about.features.title')}</h2>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {features.map((feature) => (
              <div key={feature.key} className='p-6 bg-white rounded-lg shadow-sm'>
                <div className='flex items-center mb-4'>
                  <feature.icon className='w-6 h-6 text-blue-600' />
                  <h3 className='ml-3 text-xl font-semibold text-gray-900'>
                    {t(`about.features.${feature.key}`)}
                  </h3>
                </div>
                <p className='text-gray-600'>{t(`about.features.${feature.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='py-16 bg-white'>
        <div className='container px-4 mx-auto max-w-7xl'>
          <div className='grid gap-8 text-center md:grid-cols-4'>
            {stats.map((stat) => (
              <div key={stat.key}>
                <div className='text-4xl font-bold text-blue-600'>{stat.value}</div>
                <div className='mt-2 text-gray-600'>{t(`about.stats.${stat.key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}