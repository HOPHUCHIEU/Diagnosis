import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppSelector } from '@/redux/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PersonalInfo from '@/components/Dashboard/Form/PersonalInfo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AppointmentStats } from './AppointmentStats'
import { AppointmentHistory } from './AppointmentHistory'
import { PaymentHistory } from './PaymentHistory'
import { ProfilePatient } from './ProfilePatient'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'

export default function ProfileDoctor() {
  const user = useAppSelector((state) => state.authState.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('personal')

  // Kiểm tra nếu có paymentId trong URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const paymentId = queryParams.get('paymentId')

    if (paymentId) {
      // Chuyển đến tab lịch sử thanh toán
      setActiveTab('history_payment')

      // Hiển thị thông báo
      toast.success(CustomNotification, {
        data: {
          title: 'Thanh toán thành công',
          content: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.'
        }
      })

      // Xóa paymentId khỏi URL
      navigate('/profile', { replace: true })
    }
  }, [location.search, navigate])

  if (!user) return null

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='flex-wrap min-w-[380px] !justify-start'>
          <TabsTrigger value='personal'>Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value='user'>Hồ sơ bệnh nhân</TabsTrigger>
          <TabsTrigger value='number_appointment'>Lượt khám bệnh</TabsTrigger>
          <TabsTrigger value='history_appoinment'>Lịch sử khám bệnh</TabsTrigger>
          <TabsTrigger value='history_payment'>Lịch sử thanh toán</TabsTrigger>
        </TabsList>
        <TabsContent value='personal'>
          <Card>
            <CardContent>
              <PersonalInfo user={user} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='user'>
          <ScrollArea className='mb-4 h-full'>
            <Card>
              <CardContent>
                <ProfilePatient user={user} />
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
        <TabsContent value='number_appointment'>
          <Card>
            <CardHeader>
              <CardTitle>Thống kê lượt khám</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentStats />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='history_appoinment'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử khám bệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentHistory />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='history_payment'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
