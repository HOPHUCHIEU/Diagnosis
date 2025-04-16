import { createApi } from '@reduxjs/toolkit/query/react'
import customFetchBase from './customFetchBase'
import { CreateDoctorProfileInput, DoctorProfile } from '@/types/doctor.type'

export const doctorApi = createApi({
  reducerPath: 'doctorApi',
  baseQuery: customFetchBase,
  tagTypes: ['Doctor'],
  endpoints: (build) => ({
    getDoctorProfile: build.query<{ data: DoctorProfile }, string>({
      query: (id) => ({
        url: `doctor-profile/${id}`,
        method: 'GET',
        skip: !id // Skip the request if no ID is provided
      }),
      providesTags: ['Doctor']
    }),
    createDoctorProfile: build.mutation<{ data: DoctorProfile }, CreateDoctorProfileInput>({
      query: (data) => ({
        url: 'doctor-profile/create',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Doctor']
    }),
    updateDoctorProfile: build.mutation<{ data: DoctorProfile }, { data: Partial<CreateDoctorProfileInput> }>({
      query: (data) => ({
        url: `doctor-profile/update`,
        method: 'PATCH',
        body: data.data
      }),
      invalidatesTags: ['Doctor']
    }),
    getAllDoctors: build.query<{ data: { data: DoctorProfile[] } }, null>({
      query: () => ({
        url: 'doctor-profile/all',
        method: 'GET'
      }),
      providesTags: ['Doctor']
    })
  })
})

export const {
  useGetDoctorProfileQuery,
  useCreateDoctorProfileMutation,
  useUpdateDoctorProfileMutation,
  useGetAllDoctorsQuery // Add this export
} = doctorApi
