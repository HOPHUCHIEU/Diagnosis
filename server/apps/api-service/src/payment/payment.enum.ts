export enum PaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Paid = 'paid',
  Refunded = 'refunded',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

export enum PaymentMethod {
  VNBANK = 'VNBANK',
  VNPAYQR = 'VNPAYQR',
  INTCARD = 'INTCARD'
}

export enum PaymentLanguage {
  vi = 'vi',
  en = 'en'
}
