import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { PaymentOrder } from '@/types/payment.type'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export const exportMedicalRecord = (record: any) => {
  const doc = new jsPDF()

  // Add header
  doc.setFontSize(20)
  doc.text('Hồ sơ bệnh án', 105, 15, { align: 'center' })

  // Add patient info
  doc.setFontSize(12)
  doc.text(`Mã hồ sơ: ${record.id}`, 20, 30)
  doc.text(`Ngày khám: ${format(new Date(record.date), 'dd/MM/yyyy HH:mm', { locale: vi })}`, 20, 40)
  doc.text(`Bác sĩ: ${record.doctor}`, 20, 50)
  doc.text(`Chuyên khoa: ${record.department}`, 20, 60)

  // Add symptoms and diagnosis
  doc.text('Triệu chứng:', 20, 80)
  doc.setFontSize(10)
  doc.text(record.symptoms, 30, 90)
  doc.setFontSize(12)
  doc.text('Chẩn đoán:', 20, 110)
  doc.setFontSize(10)
  doc.text(record.diagnosis, 30, 120)

  // Add prescription table
  if (record.prescription?.medicines?.length) {
    doc.setFontSize(12)
    doc.text('Đơn thuốc:', 20, 140)

    const tableData = record.prescription.medicines.map((medicine: any) => [
      medicine.name,
      medicine.quantity + ' ' + medicine.unit,
      medicine.usage,
      medicine.price.toLocaleString('vi-VN') + ' ₫'
    ])

    doc.autoTable({
      startY: 150,
      head: [['Tên thuốc', 'Số lượng', 'Cách dùng', 'Đơn giá']],
      body: tableData,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    })
  }

  // Save the PDF
  doc.save(`medical-record-${record.id}.pdf`)
}

export const exportAllMedicalRecords = (records: any[]) => {
  // Similar to above but with multiple records
  const doc = new jsPDF()
  // ...implementation
  doc.save('medical-records.pdf')
}

export const exportPaymentInvoice = async (payment: PaymentOrder) => {
  const doc = new jsPDF()

  // Add Vietnamese font support
  doc.addFont('/fonts/Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.addFont('/fonts/Roboto-Bold.ttf', 'Roboto', 'bold')
  doc.setFont('Roboto')

  // Enable UTF-8 support
  doc.setLanguage('vi')

  // Set default font size
  doc.setFontSize(10)

  // Helper function for UTF-8 text
  const writeText = (
    text: string,
    x: number,
    y: number,
    options?: { align?: 'left' | 'center' | 'right'; fontSize?: number; isBold?: boolean }
  ) => {
    if (options?.fontSize) doc.setFontSize(options.fontSize)
    if (options?.isBold) doc.setFont('Roboto', 'bold')

    doc.text(text, x, y, { align: options?.align || 'left' })

    // Reset to default
    doc.setFontSize(10)
    doc.setFont('Roboto', 'normal')
  }

  // Add hospital info
  writeText('DIAGNOSIS IQ', 105, 20, { align: 'center', fontSize: 16, isBold: true })
  writeText('Địa chỉ: 120 Hoàng Minh Thảo, Liên Chiểu, Đà Nẵng', 105, 30, { align: 'center' })
  writeText('Hotline: 1900 1234', 105, 35, { align: 'center' })

  // Add invoice title
  writeText('HÓA ĐƠN THANH TOÁN', 105, 50, { align: 'center', fontSize: 14, isBold: true })
  writeText(`Mã hóa đơn: ${payment.id}`, 20, 60)
  writeText(`Ngày: ${format(new Date(payment.orderDate), 'dd/MM/yyyy HH:mm')}`, 20, 65)

  // Add customer info
  writeText('THÔNG TIN KHÁCH HÀNG:', 20, 80, { isBold: true })
  writeText(`Họ tên: ${payment.userName}`, 30, 90)
  writeText(`Mã khách hàng: ${payment.userId}`, 30, 95)

  // Add package details
  writeText('CHI TIẾT GÓI KHÁM:', 20, 110, { isBold: true })
  writeText(
    `Gói dịch vụ: ${payment.packageType === 'single' ? 'Khám lẻ' : `Combo ${payment.packageType.replace('combo', '')} lần`}`,
    30,
    120
  )
  writeText(`Số lượt khám: ${payment.visits} lượt`, 30, 125)
  writeText(`Hạn sử dụng: ${format(new Date(payment.expiryDate), 'dd/MM/yyyy')}`, 30, 130)

  // Add payment info
  writeText('THÔNG TIN THANH TOÁN:', 20, 145, { isBold: true })
  writeText(
    `Phương thức: ${
      {
        transfer: 'Chuyển khoản',
        cash: 'Tiền mặt',
        'e-wallet': 'Ví điện tử'
      }[payment.paymentMethod]
    }`,
    30,
    155
  )
  writeText(
    `Trạng thái: ${
      payment.paymentStatus === 'paid'
        ? 'Đã thanh toán'
        : payment.paymentStatus === 'pending'
          ? 'Chờ thanh toán'
          : 'Đã hủy'
    }`,
    30,
    160
  )

  if (payment.transactionId) {
    writeText(`Mã giao dịch: ${payment.transactionId}`, 30, 165)
  }

  // Add total amount
  const amount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(payment.amount)

  writeText('Tổng tiền:', 20, 180, { fontSize: 12, isBold: true })
  writeText(amount, 105, 180, { align: 'right', fontSize: 12, isBold: true })

  // Add footer
  writeText('Xin cảm ơn quý khách!', 105, 200, { align: 'center' })
  writeText('Vui lòng giữ hóa đơn để đối chiếu khi cần thiết.', 105, 205, { align: 'center' })

  // Save the PDF
  doc.save(`hoa-don-${payment.id}.pdf`)
}
