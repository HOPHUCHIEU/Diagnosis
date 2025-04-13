import { User } from './user.type'
import { SuccessResponse } from './utils.type'

// export type AuthResponse = SuccessResponse<{
//   message?: string
//   accessToken: string
//   expiresIn: string
//   role: Role
// }>

export type AuthResponse = {
  message?: string
  access_token: string
  refreshToken: string
  expiresIn: string
  data?: User
}

export type LoginInput = {
  email: string
  password: string
}
export type RegisterInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}
