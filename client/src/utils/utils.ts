import { hideErrorToast, showErrorToast } from '@/redux/features/errorToast.slice'
import { RootState } from '@/redux/store'
import { ErrorData } from '@/types/utils.type'
import { format, parseISO } from 'date-fns'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

export const bufferToHex = (input: any): string => {
  if (typeof input === 'string') {
    return input
  } else if (input?.buffer?.data && Array.isArray(input.buffer.data)) {
    return input.buffer.data.map((byte: number) => byte.toString(16).padStart(2, '0')).join('')
  } else if (input?.data && Array.isArray(input.data)) {
    return input.data.map((byte: number) => byte.toString(16).padStart(2, '0')).join('')
  } else if (input instanceof Uint8Array) {
    return Array.from(input)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  } else if (input instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(input))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  } else {
    return ''
    // throw new Error(`Invalid input format: ${JSON.stringify(input)}`)
  }
}

export const getAccessToken = () => {
  const accessTokenString = Cookies.get('accessToken')
  // console.log('accessTokenString', accessTokenString)
  if (accessTokenString) {
    try {
      const accessToken = accessTokenString
      return accessToken
    } catch (error) {
      console.error('Error parsing access token from cookie:', error)
      return null
    }
  }
  return null
}

export function extractErrorMessage(error: any): string {
  console.log('[INFO] Extracting error message:', error)

  if (error instanceof Error) {
    return error.message
  }

  const errorData = error as ErrorData

  // Xử lý các trường hợp message có thể là mảng
  const possibleMessages = [
    errorData?.data?.data?.message,
    errorData?.data?.message,
    errorData?.message,
    errorData?.error
  ]

  for (const message of possibleMessages) {
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    if (typeof message === 'string' && message) {
      return message
    }
  }

  return 'Có lỗi xảy ra trong quá trình xử lý.'
}

export const myPromiseHandle = (timeout: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5
      if (success) {
        resolve('Thành công!')
      } else {
        reject(new Error('Thất bại!'))
      }
    }, timeout)
  })
}

export function HandleSubmitPromise({ promise, title, thenFunc }: any) {
  const dispatch = useDispatch()
  const isErrorToastDisplayed = useSelector((state: RootState) => state.errorToast.isErrorToastDisplayed)
  if (!isErrorToastDisplayed) {
    toast
      .promise(promise, {
        pending: 'Đang xử lý...',
        success: title,
        error: {
          render({ data }) {
            console.log('ERROR', data)
            dispatch(showErrorToast())
            dispatch(hideErrorToast())
            return extractErrorMessage(data)
          }
        }
      })
      .then((response) => {
        console.log('response', response)
        thenFunc()
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }
}
export function formatDateOfBirth(dateOfBirth?: string, formatString: string = 'dd/MM/yyyy'): string {
  try {
    if (!dateOfBirth) {
      return '--'
    }
    const parsedDate = parseISO(dateOfBirth)
    return format(parsedDate, formatString)
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error)
    return '--'
  }
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
