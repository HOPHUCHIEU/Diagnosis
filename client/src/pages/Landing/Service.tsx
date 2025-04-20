import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import path from '@/constants/path'

export default function Service() {
  const { t } = useTranslation('landing')

  return (
    <>
      <Helmet>
        <title>{t('about.title')} | DiagnosisIQ</title>
        <meta name='description' content={t('about.description')} />
      </Helmet>

      <div className='container mx-auto px-4 py-16'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <h1 className='text-4xl font-bold mb-6'>{t('about.title')}</h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>{t('about.subtitle')}</p>
        </motion.div>

        <div className='grid md:grid-cols-2 gap-12 items-center mb-20'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className='text-3xl font-bold mb-6'>{t('about.mission.title')}</h2>
            <p className='text-gray-600 mb-4'>{t('about.mission.description')}</p>
            <Link to={path.services} className='inline-flex items-center text-primary hover:text-primary/90'>
              {t('about.mission.learnMore')} →
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='rounded-lg overflow-hidden shadow-lg'
          >
            <img
              src='https://media.baotintuc.vn/Upload/pTMF1jgWpbjY1m8G1xWUsg/files/2021/08/baidacbiet/anhchinh.jpg'
              alt='Mission'
              className='w-full h-auto'
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='grid md:grid-cols-3 gap-8 mb-20'
        >
          <div className='text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow'>
            <img
              src='https://media.baotintuc.vn/Upload/pTMF1jgWpbjY1m8G1xWUsg/files/2021/08/baidacbiet/anhchinh.jpg'
              alt='Expert Doctors'
              className='w-20 h-20 mx-auto mb-4'
            />
            <h3 className='text-xl font-bold mb-4'>{t('about.features.experts')}</h3>
            <p className='text-gray-600'>{t('about.features.expertsDesc')}</p>
          </div>
          <div className='text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow'>
            <img
              src='https://media.baotintuc.vn/Upload/pTMF1jgWpbjY1m8G1xWUsg/files/2021/08/baidacbiet/anhchinh.jpg'
              alt='AI Assistant'
              className='w-20 h-20 mx-auto mb-4'
            />
            <h3 className='text-xl font-bold mb-4'>{t('about.features.ai')}</h3>
            <p className='text-gray-600'>{t('about.features.aiDesc')}</p>
          </div>
          <div className='text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow'>
            <img
              src='https://media.baotintuc.vn/Upload/pTMF1jgWpbjY1m8G1xWUsg/files/2021/08/baidacbiet/anhchinh.jpg'
              alt='Telemedicine'
              className='w-20 h-20 mx-auto mb-4'
            />
            <h3 className='text-xl font-bold mb-4'>{t('about.features.telemedicine')}</h3>
            <p className='text-gray-600'>{t('about.features.telemedicineDesc')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className='text-center bg-gray-50 rounded-2xl p-12'
        >
          <h2 className='text-3xl font-bold mb-6'>{t('about.contact.title')}</h2>
          <p className='text-xl text-gray-600 mb-8'>{t('about.contact.description')}</p>
          <div className='inline-flex gap-4'>
            <Link
              to={path.contact}
              className='bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
            >
              {t('about.contact.getInTouch')}
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
