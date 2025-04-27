import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from './features/auth.slice'
import errorToastSlice from './features/errorToast.slice'
import { authApi } from './services/authApi'
import { userApi } from './services/userApi'
import { doctorApi } from './services/doctorApi'
import { patientApi } from './services/patientApi'
import { workScheduleApi } from './services/workScheduleApi'
import { publicApi } from './services/publicApi'
import { appointmentApi } from './services/appointmentApi'
import { packageApi } from './services/packageApi'
import { paymentApi } from './services/paymentApi'
import { reviewApi } from './services/reviewApi'
import { chatbotApi } from './services/chatbotApi'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [workScheduleApi.reducerPath]: workScheduleApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
    [packageApi.reducerPath]: packageApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [chatbotApi.reducerPath]: chatbotApi.reducer,
    errorToast: errorToastSlice,
    authState: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      doctorApi.middleware,
      patientApi.middleware,
      workScheduleApi.middleware,
      publicApi.middleware,
      appointmentApi.middleware,
      packageApi.middleware,
      paymentApi.middleware,
      reviewApi.middleware,
      chatbotApi.middleware
    )
})
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
