import { useConfirmTokenMutation } from '@/redux/services/authApi'
import { useGetMeQuery } from '@/redux/services/userApi'
import { useGoogleOneTapLogin } from '@react-oauth/google'
import { useEffect } from 'react'

export default function GoogleOneTap() {
  const [confirmToken, { data }] = useConfirmTokenMutation()
  const { refetch: refetchGetMe } = useGetMeQuery(null)

  useEffect(() => {
    if (data) {
      refetchGetMe()
    }
  }, [data, refetchGetMe])

  useGoogleOneTapLogin({
    onSuccess: (response) => {
      if (!response.credential) {
        console.error('Google login failed: Missing credential')
        return
      }
      confirmToken({ token: response.credential })
    },
    onError: () => {
      console.error('Google login failed')
    }
  })

  return <div />
}
