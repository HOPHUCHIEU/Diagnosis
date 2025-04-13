import * as bcryptjs from 'bcryptjs'

export function hashPassword(password: string) {
  return bcryptjs.hashSync(password)
}
