import { getAccessToken } from '@/utils/utils'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import { userApi } from '../services/userApi'
import { authApi } from '../services/authApi'
import { User } from '@/types/user.type'

export interface InitialState {
  isAuthenticated: boolean
  role: string | null
  user: User | null
  accessToken: string | null
}

const initialState: InitialState = {
  isAuthenticated: Cookies.get('isAuthenticated') === 'true',
  role: Cookies.get('userRole') || null,
  user: Cookies.get('currentUser') ? JSON.parse(Cookies.get('currentUser')!) : null,
  accessToken: getAccessToken()
}
const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    setRoleUser: (state, action) => {
      state.role = action.payload
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload
    },
    logOut: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      Cookies.remove('currentUser')
      Cookies.remove('accessToken')
      Cookies.remove('userRole')
      Cookies.remove('isAuthenticated')
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logOut, (state, action) => {
      userApi.util.resetApiState()
      authApi.util.resetApiState()
    })
  }
})

export default auth.reducer

export const { logOut, setUser, setAccessToken, setAuthenticated, setRoleUser } = auth.actions
