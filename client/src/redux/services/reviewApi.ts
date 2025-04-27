import { createApi } from '@reduxjs/toolkit/query/react'
import customFetchBase from './customFetchBase'
import { ApiResponse } from '@/types/api.type'

interface Review {
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
    _id: Buffer
    appointmentDate: string
    type: string
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
}

interface ReviewResponse {
  data: {
    reviews: Review[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

interface CreateReviewRequest {
  appointmentId: string
  rating: number
  comment: string
  tags: string[]
}

interface RespondToReviewRequest {
  reviewId: string
  response: string
}

interface GetAllReviewsParams {
  page?: number
  limit?: number
  isVisible?: boolean
}

interface ToggleVisibilityResponse {
  message: string
}

interface DeleteReviewResponse {
  message: string
}

interface CreateReviewResponse {
  message: string
  data: Review
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: customFetchBase,
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    getAppointmentReviews: builder.query<ReviewResponse, string>({
      query: (appointmentId) => ({
        url: `/review/appointment/${appointmentId}`,
        method: 'GET'
      }),
      providesTags: (result, error, appointmentId) => [{ type: 'Review', id: appointmentId }]
    }),

    getAllReviews: builder.query<ReviewResponse, GetAllReviewsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params && params.page !== undefined) queryParams.append('page', params.page.toString())
        if (params && params.limit !== undefined) queryParams.append('limit', params.limit.toString())
        if (params && params.isVisible !== undefined) queryParams.append('isVisible', params.isVisible.toString())

        return {
          url: `/review/all?${queryParams.toString()}`,
          method: 'GET'
        }
      },
      providesTags: [{ type: 'Review', id: 'LIST' }]
    }),

    createReview: builder.mutation<ApiResponse<CreateReviewResponse>, CreateReviewRequest>({
      query: (reviewData) => ({
        url: '/review/create',
        method: 'POST',
        body: reviewData
      }),
      invalidatesTags: (result, error, { appointmentId }) => [{ type: 'Review', id: appointmentId }]
    }),

    respondToReview: builder.mutation<ApiResponse<{ message: string }>, RespondToReviewRequest>({
      query: (responseData) => ({
        url: '/review/respond',
        method: 'POST',
        body: responseData
      }),
      invalidatesTags: (result, error, { reviewId }) => [{ type: 'Review', id: 'LIST' }]
    }),

    deleteReview: builder.mutation<ApiResponse<DeleteReviewResponse>, string>({
      query: (reviewId) => ({
        url: `/review/delete/${reviewId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, reviewId) => [{ type: 'Review', id: 'LIST' }]
    }),

    toggleReviewVisibility: builder.mutation<
      ApiResponse<ToggleVisibilityResponse>,
      { reviewId: string; isVisible: boolean }
    >({
      query: ({ reviewId, isVisible }) => ({
        url: `/review/${reviewId}/visibility`,
        method: 'PATCH',
        body: { isVisible }
      }),
      invalidatesTags: (result, error, { reviewId }) => [{ type: 'Review', id: 'LIST' }]
    })
  })
})

export const {
  useGetAppointmentReviewsQuery,
  useGetAllReviewsQuery,
  useCreateReviewMutation,
  useRespondToReviewMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation
} = reviewApi
