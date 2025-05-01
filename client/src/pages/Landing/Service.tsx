import { useTranslation } from 'react-i18next'
import {
    Brain,
    Bone,
    Heart,
    Baby,
    Eye,
    Pill,
    ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import path from '@/constants/path'

export default function Service() {
    const { t } = useTranslation('landing')

    return (
        <div className='w-full min-h-screen bg-white'>
            {/* Hero Section */}
            <div className='relative bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32'>
                <div className='container px-4 mx-auto max-w-7xl'>
                    <div className='text-center'>
                        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                            {t('services.hero.title')}
                        </h1>
                        <p className='max-w-2xl mx-auto mt-6 text-lg text-gray-600'>
                            {t('services.hero.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Medical Services Grid */}
            <div className='py-20 bg-white'>
                <div className='container px-4 mx-auto max-w-7xl'>
                    <h2 className='mb-12 text-3xl font-bold text-center text-gray-900'>{t('services.specialties.title')}</h2>
                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='p-6 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:shadow-md'>
                            <div className='flex items-center mb-4'>
                                <Brain className='w-8 h-8 text-blue-600' />
                                <h3 className='ml-3 text-xl font-semibold text-gray-900'>{t('services.specialties.neurology.title')}</h3>
                            </div>
                            <p className='text-gray-600'>{t('services.specialties.neurology.description')}</p>
                            <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                {t('services.specialties.neurology.items', { returnObjects: true }).map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className='p-6 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:shadow-md'>
                            <div className='flex items-center mb-4'>
                                <Heart className='w-8 h-8 text-blue-600' />
                                <h3 className='ml-3 text-xl font-semibold text-gray-900'>{t('services.specialties.cardiology.title')}</h3>
                            </div>
                            <p className='text-gray-600'>{t('services.specialties.cardiology.description')}</p>
                            <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                {t('services.specialties.cardiology.items', { returnObjects: true }).map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className='p-6 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:shadow-md'>
                            <div className='flex items-center mb-4'>
                                <Bone className='w-8 h-8 text-blue-600' />
                                <h3 className='ml-3 text-xl font-semibold text-gray-900'>{t('services.specialties.orthopedics.title')}</h3>
                            </div>
                            <p className='text-gray-600'>{t('services.specialties.orthopedics.description')}</p>
                            <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                {t('services.specialties.orthopedics.items', { returnObjects: true }).map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className='p-6 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:shadow-md'>
                            <div className='flex items-center mb-4'>
                                <Baby className='w-8 h-8 text-blue-600' />
                                <h3 className='ml-3 text-xl font-semibold text-gray-900'>{t('services.specialties.pediatrics.title')}</h3>
                            </div>
                            <p className='text-gray-600'>{t('services.specialties.pediatrics.description')}</p>
                            <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                {t('services.specialties.pediatrics.items', { returnObjects: true }).map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className='p-6 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:shadow-md'>
                            <div className='flex items-center mb-4'>
                                <Eye className='w-8 h-8 text-blue-600' />
                                <h3 className='ml-3 text-xl font-semibold text-gray-900'>{t('services.specialties.ophthalmology.title')}</h3>
                            </div>
                            <p className='text-gray-600'>{t('services.specialties.ophthalmology.description')}</p>
                            <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                {t('services.specialties.ophthalmology.items', { returnObjects: true }).map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className='p-6 transition-all duration-200 bg-white border rounded-lg shadow-sm hover:shadow-md'>
                            <div className='flex items-center mb-4'>
                                <Pill className='w-8 h-8 text-blue-600' />
                                <h3 className='ml-3 text-xl font-semibold text-gray-900'>{t('services.specialties.internal.title')}</h3>
                            </div>
                            <p className='text-gray-600'>{t('services.specialties.internal.description')}</p>
                            <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                                {t('services.specialties.internal.items', { returnObjects: true }).map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className='py-16 bg-blue-50'>
                <div className='container px-4 mx-auto text-center max-w-7xl'>
                    <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
                        {t('listDoctor.title')}
                    </h2>
                    <p className='max-w-2xl mx-auto mt-6 text-lg text-gray-600'>
                        {t('listDoctor.subtitle')}
                    </p>
                    <div className='mt-10'>
                        <Link to={path.booking}>
                            <Button className='px-8 py-6 text-lg'>
                                {t('listDoctor.bookAppointment')}
                                <ArrowRight className='w-5 h-5 ml-2' />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}