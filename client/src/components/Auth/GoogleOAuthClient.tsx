import { useEffect } from 'react'
import { useGetMeQuery } from '@/redux/services/userApi'
import { useConfirmTokenMutation } from '@/redux/services/authApi'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-toastify'

const GoogleOAuthClient = () => {
  const [confirmToken, { data }] = useConfirmTokenMutation()
  const { refetch: refetchGetMe } = useGetMeQuery(null)

  useEffect(() => {
    if (data) {
      refetchGetMe()
    }
  }, [data, refetchGetMe])

  return (
    <div className='flex items-center w-full'>
      <GoogleLogin
        theme='outline'
        size='large'
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            confirmToken({ token: credentialResponse.credential })
          }
        }}
        onError={() => {
          toast.error('Login Failed')
        }}
        use_fedcm_for_prompt={true}
        containerProps={{
          style: {
            width: 'auto',
            margin: '0 auto'
          }
        }}
      />
    </div>
  )
}

export default GoogleOAuthClient
