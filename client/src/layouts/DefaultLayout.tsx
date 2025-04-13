import { memo, useEffect, useCallback } from 'react'
import { animateScroll as scroll } from 'react-scroll'
import { useAppSelector } from '@/redux/store'
import GoogleOneTap from '@/components/Auth/GoogleOneTap'
import { Header } from './components/Landing/Header'
import Chatbot from '@/components/Global/Chatbot'

interface Props {
  children?: React.ReactNode
}

function DefaultLayoutInner({ children }: Props) {
  const isAuthen = useAppSelector((state) => state.authState.isAuthenticated)

  const handleGoogleOneTap = useCallback(() => {
    if (isAuthen) {
      const interval = setInterval(() => {
        const googleOneTapElement = document.getElementById('credential_picker_container')
        if (googleOneTapElement) {
          googleOneTapElement.style.display = 'none'
        }
      }, 100)
      setTimeout(() => clearInterval(interval), 1000)
    }
  }, [isAuthen])

  useEffect(() => {
    handleGoogleOneTap()
  }, [handleGoogleOneTap])

  const scrollToTop = useCallback(() => {
    scroll.scrollToTop({ duration: 300, smooth: true })
  }, [])

  useEffect(() => {
    scrollToTop()
  }, [scrollToTop])

  return (
    <div className='flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-white'>
      {!isAuthen && <GoogleOneTap />}
      <Header />
      <div className='max-w-screen-xl w-full px-6 mx-auto sm:px-10 mt-28 mb-12 lg:mt-[98px]'>{children}</div>
      <Chatbot />
    </div>
  )
}

const DefaultLayout = memo(DefaultLayoutInner, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children
})

export default DefaultLayout
