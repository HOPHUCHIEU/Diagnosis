import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation('landing')
  return (
    <section className='flex flex-col items-end w-full gap-10 lg:flex-row lg:justify-between'>
      <h2 className='text-7xl'>
        {t('hero.title.make')} <span className='font-semibold text-primary'>{t('hero.title.easy')}</span>{' '}
        {t('hero.title.and')} <span className='font-semibold text-primary'>{t('hero.title.fast')}</span>
      </h2>
      <p className='text-[#555] text-xl'>{t('hero.subtitle')}</p>
    </section>
  )
}
