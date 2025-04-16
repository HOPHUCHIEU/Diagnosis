import { createApi } from '@reduxjs/toolkit/query/react'
import customFetchBase from './customFetchBase'
import { ApiResponse } from '@/types/api.type'
import { Package } from './packageApi'

export interface Payment {
  _id: {
    buffer: {
      type: string
      data: number[]
    }
  }
  package: {
    _id: {
      buffer: {
        type: string
        data: number[]
      }
    }
    name: string
    description: string
    appointmentCount: number
    price: number
    isActive: boolean
    validityPeriod: number
    features: string[]
  } | null
  user: {
    _id: {
      buffer: {
        type: string
        data: number[]
      }
    }
    profile?: {
      _id: {
        buffer: {
          type: string
          data: number[]
        }
      }
      firstName: string
      lastName: string
    }
  }
  total_price: number
  status: 'pending' | 'paid' | 'cancelled'
  payment_date?: string
  bank_code: string
  ip_address: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface CreatePaymentUrlParams {
  packageId: string
  bankCode: 'VNBANK' | 'VNPAYQR' | 'INTCARD'
  language: string
}

export interface PaymentUrlResponse {
  paymentUrl: string
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: customFetchBase,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    getAllPayments: builder.query<ApiResponse<Payment[]>, null>({
      query: () => ({
        url: '/payment/all',
        method: 'GET'
      }),
      providesTags: ['Payment']
    }),
    getMyPayments: builder.query<ApiResponse<Payment[]>, null>({
      query: () => ({
        url: '/payment/my-payments',
        method: 'GET'
      }),
      providesTags: ['Payment']
    }),
    getPaymentById: builder.query<ApiResponse<Payment>, string>({
      query: (id: string) => ({
        url: `/payment/${id}`,
        method: 'GET'
      }),
      providesTags: (_: any, __: any, id: string) => [{ type: 'Payment', id }]
    }),
    createPaymentUrl: builder.mutation<ApiResponse<PaymentUrlResponse>, CreatePaymentUrlParams>({
      query: (body: CreatePaymentUrlParams) => ({
        url: '/payment/create-payment-url',
        method: 'POST',
        body
      })
    }),
    updatePaymentStatus: builder.mutation<ApiResponse<Payment>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/payment/${id}/status`,
        method: 'PUT',
        body: { status }
      }),
      invalidatesTags: (_: any, __: any, { id }: { id: string }) => [{ type: 'Payment', id }, 'Payment']
    })
  })
})

export const {
  useGetAllPaymentsQuery,
  useGetMyPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentUrlMutation,
  useUpdatePaymentStatusMutation
} = paymentApi
