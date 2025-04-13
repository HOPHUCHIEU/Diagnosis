import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Advance() {
  const { t } = useTranslation('landing')
  return (
    <section className='flex flex-col items-start gap-8 mt-12 lg:flex-row lg:justify-between'>
      <div className='min-w-[300px] flex flex-col justify-center space-y-4'>
        <h3 className='text-xl font-semibold text-primary'>{t('advantages.title')}</h3>
        <div className='mt-4 space-y-4'>
          <div className='flex items-center space-x-3 text-[#555] text-lg'>
            <img src='/landing/appointment.svg' alt='appointment' className='w-6 h-6' />
            <p>{t('advantages.items.appointment')}</p>
          </div>
          <div className='flex items-center space-x-3 text-[#555] text-lg'>
            <img src='/landing/tele.svg' alt='telemedicine' className='w-6 h-6' />
            <p>{t('advantages.items.telemedicine')}</p>
          </div>
          <div className='flex items-center space-x-3 text-[#555] text-lg'>
            <img src='/landing/chatbot.svg' alt='AI Assistant' className='w-6 h-6' />
            <p>{t('advantages.items.aiAssistant')}</p>
          </div>
          <div className='flex items-center space-x-3 text-[#555] text-lg'>
            <img src='/landing/dashboard.svg' alt='dashboard' className='w-6 h-6' />
            <p>{t('advantages.items.dashboard')}</p>
          </div>
        </div>
      </div>

      <div className='relative flex items-end'>
        <img src='/landing/intro.svg' alt='Doctors Team' className='max-w-full rounded-lg shadow-lg' />
        <div className='absolute bottom-[-20px] right-[-20px] bg-white w-48 h-35 p-4 rounded-lg shadow-[-10px_10px_20px_rgba(0,0,0,0.2)] transform transition-all hover:scale-105 hover:shadow-[-15px_15px_25px_rgba(0,0,0,0.3)] flex'>
          <div className='flex items-start justify-center w-1/4'>
            <img src='/landing/consultant.svg' alt='consultant' className='w-8 h-8' />
          </div>
          <div className='flex flex-col justify-start w-3/4 pr-2'>
            <p className='text-lg font-bold text-primary'>{t('consultant.title')}</p>
            <p className='text-sm text-[#555] mt-1'>{t('consultant.subtitle')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
