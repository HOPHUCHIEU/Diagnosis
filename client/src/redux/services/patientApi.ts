import { createApi } from '@reduxjs/toolkit/query/react'
import customFetchBase from './customFetchBase'
import { CreatePatientRecordInput, PatientRecord, UpdatePatientRecordInput } from '@/types/patient.type'

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: customFetchBase,
  tagTypes: ['Patient'],
  endpoints: (build) => ({
    getPatientRecord: build.query<{ data: PatientRecord }, string>({
      query: (id) => ({
        url: `patient-record/${id}`,
        method: 'GET',
        skip: !id // Skip the request if no ID is provided
      }),
      providesTags: ['Patient']
    }),
    createPatientRecord: build.mutation<{ data: PatientRecord }, CreatePatientRecordInput>({
      query: (data) => ({
        url: 'patient-record/create',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Patient']
    }),
    updatePatientRecord: build.mutation<{ data: PatientRecord }, { data: UpdatePatientRecordInput }>({
      query: (data) => ({
        url: 'patient-record/update',
        method: 'PATCH',
        body: data.data
      }),
      invalidatesTags: ['Patient']
    })
  })
})

export const { useGetPatientRecordQuery, useCreatePatientRecordMutation, useUpdatePatientRecordMutation } = patientApi
