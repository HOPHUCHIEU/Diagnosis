import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { DoctorProfile } from '@/types/doctor.type'
import { baseURLAPI } from '@/constants/url'
import { GetDoctorScheduleResponse } from '@/types/workSchedule.type'

interface GetDoctorScheduleParams {
  id: string
  startDate: string
  endDate: string
  includeAll?: boolean
}

interface GetDoctorAvailabilityParams {
  id: string
  startDate: string
  endDate: string
}

interface BookedSlot {
  id: {
    buffer: {
      type: string
      data: number[]
    }
  }
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

interface AvailableSession {
  start: string
  end: string
}

interface DoctorAvailability {
  id: {
    buffer: {
      type: string
      data: number[]
    }
  }
  date: string
  availableSessions: {
    morning?: AvailableSession
    afternoon?: AvailableSession
    evening?: AvailableSession
  }
  bookedSlots: BookedSlot[]
  defaultConsultationDuration: number
}

interface DoctorAvailabilityResponse {
  timestamp: string
  code: number
  message: string
  data: DoctorAvailability[]
}

interface DoctorReviewsResponse {
  data: {
    reviews: Array<{
      _id: Buffer
      patient: {
        _id: Buffer
        profile: {
          _id: Buffer
          firstName: string
          lastName: string
        }
      }
      doctor: {
        _id: Buffer
        profile: {
          _id: Buffer
          firstName: string
          lastName: string
        }
      }
      appointment: {
        buffer: {
          type: string
          data: number[]
        }
      }
      rating: number
      comment: string
      isVerified: boolean
      tags: string[]
      isVisible: boolean
      createdAt: string
      updatedAt: string
      adminReply?: string
      adminReplyAt?: string
    }>
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
    stats: {
      averageRating: number
      totalReviews: number
    }
  }
}

interface GetDoctorReviewsParams {
  id: string
  page?: number
  limit?: number
}

const baseUrl = baseURLAPI

export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl
  }),
  tagTypes: ['DoctorSchedule', 'DoctorAvailability'],
  endpoints: (build) => ({
    getPublicDoctors: build.query<{ data: { data: DoctorProfile[] } }, void>({
      query: () => ({
        url: 'doctor-profile/all',
        method: 'GET'
      })
    }),
    getPublicDoctorProfile: build.query<{ data: DoctorProfile }, string>({
      query: (id) => ({
        url: `doctor-profile/${id}`,
        method: 'GET',
        skip: !id
      })
    }),
    getPublicDoctorSchedule: build.query<GetDoctorScheduleResponse, GetDoctorScheduleParams>({
      query: ({ id, startDate, endDate, includeAll }) => ({
        url: `work-schedule/doctor`,
        method: 'GET',
        params: {
          id,
          startDate,
          endDate,
          includeAll
        },
        skip: !id
      }),
      providesTags: ['DoctorSchedule']
    }),
    getDoctorReviews: build.query<DoctorReviewsResponse, GetDoctorReviewsParams>({
      query: ({ id, page = 1, limit = 10 }) => ({
        url: `review/doctor/${id}`,
        method: 'GET',
        params: {
          page,
          limit
        },
        skip: !id
      })
    }),
    getDoctorAvailability: build.query<DoctorAvailabilityResponse, GetDoctorAvailabilityParams>({
      query: ({ id, startDate, endDate }) => ({
        url: `work-schedule/doctor/availability`,
        method: 'GET',
        params: {
          id,
          startDate,
          endDate
        },
        skip: !id
      }),
      providesTags: ['DoctorAvailability']
    })
  })
})

export const {
  useGetPublicDoctorsQuery,
  useGetPublicDoctorProfileQuery,
  useGetPublicDoctorScheduleQuery,
  useGetDoctorReviewsQuery,
  useGetDoctorAvailabilityQuery
} = publicApi
