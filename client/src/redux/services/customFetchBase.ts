import { toast } from 'react-toastify'
import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'
import { RootState } from '../store'
import { logOut } from '../features/auth.slice'
import { extractErrorMessage, getAccessToken } from '@/utils/utils'
import { baseURLAPI } from '@/constants/url'
import { ErrorResponse } from 'react-router-dom'
import { hideErrorToast, showErrorToast } from '../features/errorToast.slice'
import { CustomNotification } from '@/components/CustomReactToastify'

const baseUrl = baseURLAPI
const REFRESH_TIMEOUT = 10000
const ERROR_DISPLAY_DURATION = 3000
const MAX_RETRIES = 2

const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).authState.accessToken || getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
      headers.set('Content-Type', 'application/json')
    }
    return headers
  }
})

const isToastExcludedEndpoint = (args: string | FetchArgs) => {
  if (typeof args === 'string') {
    return args === 'user' || args.includes('user/') || args === 'auth/register'
  }
  return (
    (args.url === 'user' || args.url.includes('user/') || args.url === 'auth/register') &&
    ['POST', 'PATCH'].includes(args.method || '')
  )
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const handleErrorToast = (message: string, api: any) => {
  // resetStatusToast
  api.dispatch(hideErrorToast())

  api.dispatch(showErrorToast())
  toast.error(CustomNotification, {
    data: {
      title: 'Error!',
      content: message
    },
    autoClose: ERROR_DISPLAY_DURATION,
    onClose: () => api.dispatch(hideErrorToast()),
    position: 'top-right',
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  })
}
const retryRequest = async (args: string | FetchArgs, api: any, extraOptions: any, retryCount = 0): Promise<any> => {
  const isAuthLogin =
    typeof args === 'string'
      ? args.includes('auth/login') ||
        args.includes('auth/register') ||
        args.includes('user/') ||
        args.includes('auth/verify-email')
      : args.url.includes('auth/login') ||
        args.url.includes('auth/register') ||
        args.url.includes('user/') ||
        args.url.includes('auth/verify-email')
  try {
    const result = await baseQuery(args, api, extraOptions)

    if (isAuthLogin) {
      return result
    }

    if (result.error && retryCount < MAX_RETRIES) {
      await delay(1000 * (retryCount + 1))
      return retryRequest(args, api, extraOptions, retryCount + 1)
    }
    return result
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await delay(1000 * (retryCount + 1))
      return retryRequest(args, api, extraOptions, retryCount + 1)
    }
    throw error
  }
}

const customFetchBase: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const state = api.getState() as RootState
  const token = state.authState.accessToken || getAccessToken()
  const isAuthRequest = typeof args === 'string' ? args.includes('auth') : args.url.includes('auth')

  if (!token && !isAuthRequest) {
    return {
      error: {
        status: 401,
        data: { message: 'Không tìm thấy token, vui lòng đăng nhập lại.' }
      }
    }
  }

  try {
    let result = await retryRequest(args, api, extraOptions)
    const errorMessage = result.error
      ? extractErrorMessage(result.error as ErrorResponse)
      : (result.data as ErrorResponse)?.data?.message
    if (errorMessage) {
      // Xử lý token hết hạn
      if (errorMessage === 'Invalid Token or Token Expired') {
        if (!mutex.isLocked()) {
          const release = await mutex.acquire()
          try {
            // Thực hiện refresh token với timeout
            const refreshPromise = baseQuery({ url: 'auth/refresh', method: 'POST' }, api, extraOptions)
            const timeoutPromise = delay(REFRESH_TIMEOUT)

            const refreshResult = (await Promise.race([refreshPromise, timeoutPromise])) as
              | { data: any; error?: never }
              | { data?: never; error: FetchBaseQueryError }
              | undefined

            if (refreshResult && 'data' in refreshResult) {
              result = await baseQuery(args, api, extraOptions)
            } else {
              api.dispatch(logOut())
              handleErrorToast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', api)
            }
          } finally {
            release()
          }
        } else {
          await mutex.waitForUnlock()
          result = await baseQuery(args, api, extraOptions)
        }
      } else {
        if (!isToastExcludedEndpoint(args)) {
          handleErrorToast(errorMessage, api)
        }
        return {
          error: {
            status: result.error?.status || 400,
            data: { message: errorMessage }
          }
        }
      }
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra'
    if (!isToastExcludedEndpoint(args)) {
      handleErrorToast(errorMessage, api)
    }
    return {
      error: {
        status: 500,
        data: { message: errorMessage }
      }
    }
  }
}
export default customFetchBase
