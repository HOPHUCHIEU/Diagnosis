// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createApi } from '@reduxjs/toolkit/query/react'

import customFetchBase from './customFetchBase'
import { userApi } from './userApi'
import { AuthResponse, LoginInput, RegisterInput } from '@/types/auth.type'
import { setAccessToken, setRoleUser } from '../features/auth.slice'
import Cookies from 'js-cookie'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: customFetchBase,
  endpoints: (build) => ({
    loginUser: build.mutation<{ data: AuthResponse }, LoginInput>({
      query: (data) => ({
        url: 'auth/login',
        method: 'POST',
        body: data
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          console.log('LOGIN DATA', data)
          await dispatch(setAccessToken(data.data.access_token))
          Cookies.set('accessToken', data.data.access_token)
          Cookies.set('isAuthenticated', 'true')
          await dispatch(userApi.endpoints.getMe.initiate(null, { forceRefetch: true }))
        } catch (error) {
          console.error('Error in loginUser:', error)
        }
      }
    }),
    changePassword: build.mutation<{ data: AuthResponse }, { oldPassword: string; newPassword: string }>({
      query(data) {
        return {
          url: `auth/change-password`,
          method: 'POST',
          body: data
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
        } catch (error) {
          console.error('Error in changePassword:', error)
        }
      }
    }),
    registerAccount: build.mutation<{ data: AuthResponse }, RegisterInput>({
      query(data) {
        return {
          url: 'auth/register',
          method: 'POST',
          body: data
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
        } catch (error) {
          console.error('Error in registerAccount onQueryStarted:', error)
        }
      }
    }),
    confirmToken: build.mutation<{ data: AuthResponse }, { token: string }>({
      query: (token) => ({
        url: 'auth/google',
        method: 'POST',
        body: token
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          await dispatch(setAccessToken(data.data.access_token))
          Cookies.set('access_token', data.data.access_token)
          Cookies.set('isAuthenticated', 'true')
        } catch (error) {
          console.error('Error in confirmToken:', error)
        }
      }
    }),

    verifyEmail: build.mutation<any, { email: string; code: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body
      })
    }),
    resendVerifyEmail: build.mutation<any, { email: string }>({
      query: (body) => ({
        url: '/auth/resend-verify-email',
        method: 'POST',
        body
      })
    }),
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body
      })
    })
  })
})

export const {
  useLoginUserMutation,
  useRegisterAccountMutation,
  useChangePasswordMutation,
  useConfirmTokenMutation,
  useVerifyEmailMutation,
  useResendVerifyEmailMutation,
  useForgotPasswordMutation
} = authApi
