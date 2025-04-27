export type PaymentStatus = 'pending' | 'paid' | 'cancelled'
export type PaymentMethod = 'transfer' | 'cash' | 'e-wallet'
export type PackageType = 'single' | 'combo3' | 'combo5' | 'combo10'

export interface PaymentOrder {
  id: string
  userId: string
  userName: string
  packageType: PackageType
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  transactionId?: string
  orderDate: string
  paidDate?: string
  note?: string
  visits: number
  remainingVisits: number
  expiryDate: string
}

export interface UpdatePaymentStatusRequest {
  orderId: string
  status: PaymentStatus
  note?: string
}
