import { PaymentOrder } from '@/types/payment.type'
import { addDays } from 'date-fns'

export const mockPayments: PaymentOrder[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    packageType: 'combo3',
    amount: 1400000,
    paymentMethod: 'transfer',
    paymentStatus: 'pending',
    orderDate: new Date().toISOString(),
    visits: 3,
    remainingVisits: 3,
    expiryDate: addDays(new Date(), 365).toISOString()
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Trần Thị B',
    packageType: 'single',
    amount: 500000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    orderDate: addDays(new Date(), -1).toISOString(),
    paidDate: new Date().toISOString(),
    visits: 1,
    remainingVisits: 1,
    expiryDate: addDays(new Date(), 365).toISOString()
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Lê Văn C',
    packageType: 'combo10',
    amount: 4000000,
    paymentMethod: 'e-wallet',
    paymentStatus: 'paid',
    transactionId: 'TX001',
    orderDate: addDays(new Date(), -2).toISOString(),
    paidDate: addDays(new Date(), -2).toISOString(),
    visits: 10,
    remainingVisits: 8,
    expiryDate: addDays(new Date(), 365).toISOString()
  }
]
