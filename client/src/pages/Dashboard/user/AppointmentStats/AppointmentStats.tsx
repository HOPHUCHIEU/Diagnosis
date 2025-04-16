import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Calendar, CheckCircle, Ticket } from 'lucide-react'
import BuyPackageDialog from './components/BuyPackageDialog'
import { useGetMyAppointmentPackageQuery } from '@/redux/services/packageApi'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TriangleAlert } from 'lucide-react'

export default function AppointmentStats() {
  const [showBuyPackage, setShowBuyPackage] = useState(false)
  const { data, isLoading, error, refetch } = useGetMyAppointmentPackageQuery(null)

  const handleCloseBuyDialog = () => {
    setShowBuyPackage(false)
    refetch() // Tải lại dữ liệu sau khi đóng dialog mua gói
  }

  const packageData = data?.data

  const stats = [
    {
      title: 'Tổng số lần khám',
      value: isLoading
        ? '...'
        : `${(packageData?.totalRemainingAppointments || 0) + (packageData?.totalUsedAppointments || 0)}`,
      icon: Calendar,
      description: 'Tất cả các lần khám',
      className: 'text-blue-500 bg-blue-50/50'
    },
    {
      title: 'Đã sử dụng',
      value: isLoading ? '...' : `${packageData?.totalUsedAppointments || 0}`,
      icon: CheckCircle,
      description: 'Lượt khám đã sử dụng',
      className: 'text-green-500 bg-green-50/50'
    },
    {
      title: 'Còn lại',
      value: isLoading ? '...' : `${packageData?.totalRemainingAppointments || 0}`,
      icon: Ticket,
      description: 'Lượt khám còn lại',
      className: 'text-purple-500 bg-purple-50/50'
    }
  ]

  if (error) {
    return (
      <Alert variant='destructive'>
        <TriangleAlert className='w-4 h-4' />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>Không thể tải dữ liệu gói khám. Vui lòng thử lại sau.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.className}>
            <CardHeader className='flex flex-row justify-between items-center pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon className='w-4 h-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='w-16 h-8' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{stat.value}</div>
                  <p className='text-xs text-muted-foreground'>{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hiển thị danh sách các gói đang sở hữu */}
      {packageData && packageData.packages.length > 0 && (
        <div className='mt-6'>
          <h3 className='mb-4 text-lg font-semibold'>Gói khám của bạn</h3>
          <div className='space-y-3'>
            {packageData.packages.map((pkg) => (
              <Card key={JSON.stringify(pkg.id)} className='bg-white'>
                <CardContent className='p-4'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <h4 className='font-medium'>{pkg.packageName}</h4>
                      <p className='text-sm text-gray-500'>
                        Còn lại: <span className='font-semibold'>{pkg.remainingAppointments}</span> lượt
                      </p>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`px-2 py-1 rounded text-xs ${pkg.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {pkg.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                      </div>
                      <p className='mt-1 text-xs text-gray-500'>
                        HSD: {new Date(pkg.expiryDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button className='w-full' onClick={() => setShowBuyPackage(true)}>
        Mua thêm lượt khám
      </Button>

      <Dialog open={showBuyPackage} onOpenChange={setShowBuyPackage}>
        <DialogContent className='max-w-4xl max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto'>
          <BuyPackageDialog onClose={handleCloseBuyDialog} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
