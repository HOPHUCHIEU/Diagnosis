export type PackageType = 'single' | 'combo3' | 'combo5' | 'combo10'

export interface AppointmentPackage {
  id: string
  type: PackageType
  visits: number
  price: number
  discount?: number
}

export interface PackageOrder {
  id: string
  userId: string
  packageId: string
  orderDate: string
  expiryDate: string
  totalAmount: number
  remainingVisits: number
  status: 'pending' | 'paid' | 'cancelled'
  paymentMethod?: string
  transactionId?: string
}
