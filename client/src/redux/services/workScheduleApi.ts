import { createApi } from '@reduxjs/toolkit/query/react'
import customFetchBase from './customFetchBase'
import {
  AdminDaySchedule,
  CreateScheduleRequest,
  GetDoctorScheduleResponse,
  GetSchedulesResponse,
  CreateMultiDayScheduleRequest,
  CreateRecurringScheduleRequest
} from '@/types/workSchedule.type'

interface GetDoctorScheduleParams {
  id: string
  startDate: string
  endDate: string
  includeAll?: boolean
}

interface GetAllScheduleParams {
  startDate: string
  endDate: string
}

interface ApproveScheduleRequest {
  id: string
  session: 'morning' | 'afternoon' | 'evening'
  day: string
}

interface RejectScheduleRequest {
  id: string
  session: 'morning' | 'afternoon' | 'evening'
  day: string
  rejectionReason: string
}

export const workScheduleApi = createApi({
  reducerPath: 'workScheduleApi',
  baseQuery: customFetchBase,
  tagTypes: ['WorkSchedule'],
  endpoints: (build) => ({
    getDoctorSchedule: build.query<GetDoctorScheduleResponse, GetDoctorScheduleParams>({
      query: ({ id, startDate, endDate, includeAll = true }) => ({
        url: `work-schedule/doctor`,
        method: 'GET',
        params: {
          id,
          startDate,
          endDate,
          includeAll
        }
      }),
      providesTags: ['WorkSchedule']
    }),
    createWorkSchedule: build.mutation<{ message: string }, CreateScheduleRequest>({
      query: (data) => ({
        url: 'work-schedule/create',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['WorkSchedule']
    }),
    getAllSchedules: build.query<GetSchedulesResponse, GetAllScheduleParams>({
      query: ({ startDate, endDate }) => ({
        url: 'work-schedule/all',
        method: 'GET',
        params: {
          startDate,
          endDate
        }
      }),
      providesTags: ['WorkSchedule']
    }),
    approveSchedule: build.mutation<{ message: string }, ApproveScheduleRequest>({
      query: ({ id, session, day }) => ({
        url: `work-schedule/approve-session/${id}`,
        method: 'POST',
        body: {
          session,
          day
        }
      }),
      invalidatesTags: () => ['WorkSchedule']
    }),
    rejectSchedule: build.mutation<{ message: string }, RejectScheduleRequest>({
      query: ({ id, session, day, rejectionReason }) => ({
        url: `work-schedule/reject-session/${id}`,
        method: 'POST',
        body: {
          session,
          day,
          rejectionReason
        }
      }),
      invalidatesTags: () => ['WorkSchedule']
    }),
    createMultiDaySchedule: build.mutation<void, CreateMultiDayScheduleRequest>({
      query: (data) => ({
        url: 'work-schedule/create-multi-day',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['WorkSchedule']
    }),
    createRecurringSchedule: build.mutation<void, CreateRecurringScheduleRequest>({
      query: (data) => ({
        url: 'work-schedule/create-recurring',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['WorkSchedule']
    })
  })
})

export const {
  useGetDoctorScheduleQuery,
  useCreateWorkScheduleMutation,
  useGetAllSchedulesQuery,
  useApproveScheduleMutation,
  useRejectScheduleMutation,
  useCreateMultiDayScheduleMutation,
  useCreateRecurringScheduleMutation
} = workScheduleApi
