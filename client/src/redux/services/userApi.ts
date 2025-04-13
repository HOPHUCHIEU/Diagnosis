import { createApi } from '@reduxjs/toolkit/query/react'
import customFetchBase from './customFetchBase'
import { logOut, setAuthenticated, setRoleUser, setUser } from '../features/auth.slice'
import { CreateUserInput, UpdateInfoUserInput, User } from '@/types/user.type'
import Cookies from 'js-cookie'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: customFetchBase,
  tagTypes: ['User'],
  endpoints: (build) => ({
    getMe: build.query<{ data: User }, null>({
      query: () => 'user/profile',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          console.log('LOG GETME', data)
          await dispatch(setRoleUser(data.data.role))
          dispatch(setUser(data.data))
          dispatch(setAuthenticated(true))
          Cookies.set('userRole', data.data.role)
          Cookies.set('currentUser', JSON.stringify(data.data))
        } catch (error) {
          dispatch(setUser(null))
          dispatch(setAuthenticated(false))
          dispatch(logOut())
        }
      }
    }),
    updateMe: build.mutation<{ data: User }, { data: UpdateInfoUserInput }>({
      query({ data }) {
        return {
          url: `user/update-profile`,
          method: 'PATCH',
          body: data
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
        } catch (error) {
          console.error('Error in updateMe:', error)
        }
      }
    }),
    getProfileUser: build.query<{ data: User }, string>({
      query: (id) => `user/find/${id}`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
        } catch (error) {
          console.log('ERROR: ', error)
        }
      }
    }),
    getAllUser: build.query<{ data: User[] }, null>({
      query: (branchId) => `user/all`,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
        } catch (error) {
          console.log('ERROR: ', error)
        }
      }
    }),
    createUser: build.mutation<{ data: User }, CreateUserInput>({
      query(data) {
        return {
          url: 'user/create',
          method: 'POST',
          body: data
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
        } catch (error) {
          console.error('Error in createUser:', error)
        }
      }
    }),
    adminUpdateUser: build.mutation<{ data: User }, { id: string; data: Partial<UpdateInfoUserInput> }>({
      query({ id, data }) {
        return {
          url: `user/update`,
          method: 'PATCH',
          body: { id, ...data }
        }
      },
      invalidatesTags: ['User']
    }),
    deleteUser: build.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({
        url: 'user/delete',
        method: 'DELETE',
        body: { id }
      }),
      invalidatesTags: ['User']
    })
  })
})
export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetProfileUserQuery,
  useCreateUserMutation,
  useGetAllUserQuery,
  useAdminUpdateUserMutation,
  useDeleteUserMutation
} = userApi
