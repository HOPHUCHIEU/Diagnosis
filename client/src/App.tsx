import { ToastContainer } from 'react-toastify'
import useRouteElements from './useRouteElements'
import { getAccessToken } from './utils/utils'
import { useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { setAccessToken } from './redux/features/auth.slice'
import { useGetMeQuery } from './redux/services/userApi'
import { useLocation } from 'react-router-dom'
import LoadingBar from 'react-top-loading-bar'
import { Info, CircleAlert, BadgeCheck, TriangleAlert } from 'lucide-react'
import { Toaster } from './components/ui/sonner'
function App() {
  const dispatch = useDispatch()
  const { refetch: refetchGetMe } = useGetMeQuery(null)
  const accessToken = getAccessToken()
  const routeElements = useRouteElements()
  const [progress, setProgress] = useState(0)
  const location = useLocation()

  useEffect(() => {
    if (accessToken) {
      Promise.all([dispatch(setAccessToken(accessToken)), refetchGetMe()])
    }
  }, [accessToken, dispatch, refetchGetMe])

  useEffect(() => {
    const startProgress = () => {
      setProgress(30)
      return setTimeout(() => setProgress(100), 400)
    }

    const timerId = startProgress()
    return () => clearTimeout(timerId)
  }, [location])

  const toastConfig = {
    position: 'top-right' as const,
    autoClose: 5000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    theme: 'light' as const,
    stacked: true
  }

  const getToastIcon = ({ type }: { type: string }) => {
    const iconClasses = {
      base: '-m-[2px] text-xl',
      info: 'text-indigo-400',
      error: 'text-red-500',
      success: 'text-green-500',
      warning: 'text-yellow-500'
    }

    switch (type) {
      case 'info':
        return <Info className={`${iconClasses.base} ${iconClasses.info}`} />
      case 'error':
        return <CircleAlert className={`${iconClasses.base} ${iconClasses.error}`} />
      case 'success':
        return <BadgeCheck className={`!w-6 !h-6 -m-[2px] ${iconClasses.success}`} />
      case 'warning':
        return <TriangleAlert className={`${iconClasses.base} ${iconClasses.warning}`} />
      default:
        return null
    }
  }

  return (
    <>
      <LoadingBar
        color='#1D2657'
        height={3}
        waitingTime={700}
        progress={progress}
        shadow={false}
        onLoaderFinished={() => setProgress(0)}
      />
      {routeElements}
      <ToastContainer {...toastConfig} icon={getToastIcon} />
      <Toaster />
    </>
  )
}

export default App
