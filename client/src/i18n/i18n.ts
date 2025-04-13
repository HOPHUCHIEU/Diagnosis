import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LANDING_EN from './locales/en/landing.json'
import LANDING_VI from './locales/vi/landing.json'

export const locales = {
  en: 'English',
  vi: 'Tiếng Việt'
}

export const resources = {
  en: {
    landing: LANDING_EN
  },
  vi: {
    landing: LANDING_VI
  }
}

export const defaultNS = 'landing'

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  ns: ['landing'],
  fallbackLng: 'vi',
  defaultNS,
  interpolation: {
    escapeValue: false
  }
})

export default i18n
