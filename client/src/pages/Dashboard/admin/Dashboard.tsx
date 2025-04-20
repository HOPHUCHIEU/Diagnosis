import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMyAppointmentsQuery } from '@/redux/services/appointmentApi'
import { useGetDoctorScheduleQuery } from '@/redux/services/workScheduleApi'
import {
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  StarIcon,
  MessageSquareTextIcon,
  DollarSignIcon,
  UsersIcon,
  PieChartIcon,
  User2Icon,
  CalendarDaysIcon
} from 'lucide-react'
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { bufferToHex } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import ReactECharts from 'echarts-for-react'
// import * as echarts from 'echarts/core'

// Mockdata cho biểu đồ thống kê cuộc hẹn theo tháng
const appointmentChartData = [
  { month: 'T1', completed: 12, pending: 5, cancelled: 3 },
  { month: 'T2', completed: 15, pending: 7, cancelled: 2 },
  { month: 'T3', completed: 18, pending: 4, cancelled: 1 },
  { month: 'T4', completed: 14, pending: 6, cancelled: 4 },
  { month: 'T5', completed: 20, pending: 8, cancelled: 2 },
  { month: 'T6', completed: 22, pending: 5, cancelled: 3 }
]

// Mockdata cho đánh giá
const ratingData = {
  average: 4.7,
  total: 126,
  distribution: [
    { stars: 5, count: 98, percentage: 78 },
    { stars: 4, count: 20, percentage: 16 },
    { stars: 3, count: 5, percentage: 4 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 1, percentage: 1 }
  ]
}

// Mockdata cho danh sách feedback
const feedbackData = [
  {
    id: 1,
    patient: {
      name: 'Nguyễn Văn A',
      avatar: '/avatars/01.png'
    },
    rating: 5,
    comment: 'Bác sĩ rất tận tâm và chuyên nghiệp. Tôi rất hài lòng với dịch vụ.',
    date: '2023-06-15'
  },
  {
    id: 2,
    patient: {
      name: 'Trần Thị B',
      avatar: '/avatars/02.png'
    },
    rating: 4,
    comment: 'Bác sĩ giải thích rất rõ ràng về tình trạng bệnh và phương pháp điều trị.',
    date: '2023-06-10'
  },
  {
    id: 3,
    patient: {
      name: 'Lê Văn C',
      avatar: '/avatars/03.png'
    },
    rating: 5,
    comment: 'Rất hài lòng với sự tư vấn và hỗ trợ từ bác sĩ.',
    date: '2023-06-05'
  }
]

// Mockdata danh sách bác sĩ và thống kê
const doctorStatsData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    specialty: 'Tim mạch',
    totalAppointments: 145,
    completedAppointments: 128,
    cancelledAppointments: 17,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Trần Thị B',
    specialty: 'Da liễu',
    totalAppointments: 122,
    completedAppointments: 110,
    cancelledAppointments: 12,
    rating: 4.7
  },
  {
    id: 3,
    name: 'Lê Văn C',
    specialty: 'Nhi khoa',
    totalAppointments: 156,
    completedAppointments: 143,
    cancelledAppointments: 13,
    rating: 4.9
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    specialty: 'Sản khoa',
    totalAppointments: 118,
    completedAppointments: 105,
    cancelledAppointments: 13,
    rating: 4.6
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    specialty: 'Tiêu hóa',
    totalAppointments: 98,
    completedAppointments: 92,
    cancelledAppointments: 6,
    rating: 4.5
  }
]

// Mockdata danh sách người dùng đặt lịch
const topUsersData = [
  {
    id: 1,
    name: 'Nguyễn Thị F',
    totalAppointments: 12,
    totalPayments: 8500000,
    lastAppointment: '2023-06-20'
  },
  {
    id: 2,
    name: 'Trần Văn G',
    totalAppointments: 10,
    totalPayments: 7200000,
    lastAppointment: '2023-06-18'
  },
  {
    id: 3,
    name: 'Phạm Thị H',
    totalAppointments: 8,
    totalPayments: 5800000,
    lastAppointment: '2023-06-15'
  },
  {
    id: 4,
    name: 'Lê Văn I',
    totalAppointments: 7,
    totalPayments: 4900000,
    lastAppointment: '2023-06-12'
  },
  {
    id: 5,
    name: 'Hoàng Thị K',
    totalAppointments: 6,
    totalPayments: 4200000,
    lastAppointment: '2023-06-10'
  }
]

// Component Date Range Picker đơn giản
const DateRangePicker = ({ onChange }: { onChange: (range: { from: Date; to: Date }) => void }) => {
  const handleClick = () => {
    const from = subDays(new Date(), 30)
    const to = new Date()
    onChange({ from, to })
  }

  return (
    <Button variant='outline' size='sm' className='gap-1 h-8' onClick={handleClick}>
      <CalendarDaysIcon className='h-3.5 w-3.5' />
      <span>30 ngày qua</span>
    </Button>
  )
}

// Cấu hình cho biểu đồ cột (Bar Chart) - ECharts
const getBarChartOptions = (data: typeof appointmentChartData) => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Hoàn thành', 'Chờ xử lý', 'Đã hủy'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.map((item) => item.month)
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Hoàn thành',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#22c55e' // green-500
        },
        data: data.map((item) => item.completed)
      },
      {
        name: 'Chờ xử lý',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#f59e0b' // amber-500
        },
        data: data.map((item) => item.pending)
      },
      {
        name: 'Đã hủy',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#ef4444' // red-500
        },
        data: data.map((item) => item.cancelled)
      }
    ]
  }
}

// Cấu hình cho biểu đồ tròn (Pie Chart) - ECharts
const getPieChartOptions = () => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: ['Hoàn thành', 'Chờ xử lý', 'Đã hủy']
    },
    series: [
      {
        name: 'Trạng thái cuộc hẹn',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 75, name: 'Hoàn thành', itemStyle: { color: '#22c55e' } },
          { value: 15, name: 'Chờ xử lý', itemStyle: { color: '#f59e0b' } },
          { value: 10, name: 'Đã hủy', itemStyle: { color: '#ef4444' } }
        ]
      }
    ],
    center: ['50%', '50%']
  }
}

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.authState)
  const doctorId = bufferToHex(user?._id)
  const [dateRange, setDateRange] = useState({ from: subDays(new Date(), 30), to: new Date() })

  const today = new Date()
  const weekStart = startOfWeek(today, { locale: vi })
  const weekEnd = endOfWeek(today, { locale: vi })
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  const weekStartFormatted = format(weekStart, 'yyyy-MM-dd')
  const weekEndFormatted = format(weekEnd, 'yyyy-MM-dd')
  const monthStartFormatted = format(monthStart, 'yyyy-MM-dd')
  const monthEndFormatted = format(monthEnd, 'yyyy-MM-dd')

  // Lấy danh sách cuộc hẹn
  const { data: appointmentsData } = useGetMyAppointmentsQuery({
    page: 1,
    limit: 100 // Lấy nhiều để thống kê được chính xác
  })

  // Lấy lịch làm việc
  const { data: scheduleData } = useGetDoctorScheduleQuery({
    id: doctorId,
    startDate: monthStartFormatted,
    endDate: monthEndFormatted
  })

  // Thống kê về cuộc hẹn
  const appointmentStats = useMemo(() => {
    if (!appointmentsData?.data?.appointments)
      return {
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0
      }

    const appointments = appointmentsData.data.appointments
    const total = appointments.length
    const completed = appointments.filter((app) => app.status === 'completed').length
    const pending = appointments.filter((app) => ['pending', 'confirmed'].includes(app.status)).length
    const cancelled = appointments.filter((app) => app.status === 'cancelled').length

    return { total, completed, pending, cancelled }
  }, [appointmentsData])

  // Thống kê về lịch làm việc
  const workScheduleStats = useMemo(() => {
    if (!scheduleData?.data)
      return {
        thisWeek: 0,
        thisMonth: 0
      }

    const schedules = scheduleData.data

    const thisWeekWorkdays = schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date)
      return scheduleDate >= weekStart && scheduleDate <= weekEnd
    }).length

    const thisMonthWorkdays = schedules.length

    return {
      thisWeek: thisWeekWorkdays,
      thisMonth: thisMonthWorkdays
    }
  }, [scheduleData, weekStart, weekEnd])

  // Hiển thị số sao dưới dạng component
  const renderStars = (count: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <StarIcon
          key={index}
          className={`h-4 w-4 ${index < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))
  }

  return (
    <div className='p-4 sm:p-6'>
      <div className='p-6 bg-white rounded-lg md:p-10'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
          <div className='col-span-2'>
            <Card className='h-full'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-xl'>Chào mừng, {user?.profile?.firstName || 'Bác sĩ'}</CardTitle>
                <CardDescription>{format(today, 'EEEE, dd/MM/yyyy', { locale: vi })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col gap-4 mt-4 md:flex-row'>
                  <div className='flex-1'>
                    <div className='mb-2 text-lg font-medium'>Thống kê tháng này</div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='flex flex-col'>
                        <span className='text-sm text-muted-foreground'>Cuộc hẹn</span>
                        <span className='text-xl font-bold'>{appointmentStats.total}</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-sm text-muted-foreground'>Đã hoàn thành</span>
                        <span className='text-xl font-bold text-green-500'>{appointmentStats.completed}</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-sm text-muted-foreground'>Chờ xử lý</span>
                        <span className='text-xl font-bold text-amber-500'>{appointmentStats.pending}</span>
                      </div>
                      <div className='flex flex-col'>
                        <span className='text-sm text-muted-foreground'>Đã hủy</span>
                        <span className='text-xl font-bold text-red-500'>{appointmentStats.cancelled}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='mb-2 text-lg font-medium'>Lịch hôm nay</div>
                    {workScheduleStats.thisWeek > 0 ? (
                      <div className='p-3 rounded-md border'>
                        <div className='flex justify-between'>
                          <div className='text-sm text-muted-foreground'>Ca sáng</div>
                          <div className='text-sm font-medium'>07:30 - 11:30</div>
                        </div>
                        <Separator className='my-2' />
                        <div className='flex justify-between'>
                          <div className='text-sm text-muted-foreground'>Ca chiều</div>
                          <div className='text-sm font-medium'>13:30 - 17:30</div>
                        </div>
                      </div>
                    ) : (
                      <div className='text-sm text-muted-foreground'>Không có lịch hôm nay</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='flex h-full min-h-[160px] w-full flex-row gap-4 rounded-lg border border-rose-500 bg-gradient-to-r from-rose-500 to-rose-700 p-6'>
            <div className='flex flex-col justify-around w-full'>
              <div className='mb-2 text-base text-rose-100'>Tiền thu được trong tháng</div>
              <div className='text-2xl font-bold text-white break-all'>₫ 24.500.000</div>
              <div className='text-sm text-rose-100'>
                <span className='inline-flex items-center text-green-300'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='mr-1 w-4 h-4'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                      clipRule='evenodd'
                    />
                  </svg>
                  12.5%
                </span>{' '}
                so với tháng trước
              </div>
            </div>
            <div className='p-3 my-auto text-rose-100 bg-rose-600 rounded-full'>
              <DollarSignIcon className='w-8 h-8' />
            </div>
          </div>
          <div className='flex h-full min-h-[160px] w-full flex-row gap-4 rounded-lg border border-blue-500 bg-gradient-to-r from-blue-500 to-blue-700 p-6'>
            <div className='flex flex-col justify-around w-full'>
              <div className='mb-2 text-base text-blue-100'>Bệnh nhân mới trong tháng</div>
              <div className='text-2xl font-bold text-white break-all'>48 bệnh nhân</div>
              <div className='text-sm text-blue-100'>
                <span className='inline-flex items-center text-green-300'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='mr-1 w-4 h-4'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                      clipRule='evenodd'
                    />
                  </svg>
                  8.2%
                </span>{' '}
                so với tháng trước
              </div>
            </div>
            <div className='p-3 my-auto text-blue-100 bg-blue-600 rounded-full'>
              <UsersIcon className='w-8 h-8' />
            </div>
          </div>
        </div>

        <div className='p-6 my-6 rounded-lg shadow-sm bg-slate-50'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='col-span-1 md:col-span-2'>
              <Tabs defaultValue='appointments'>
                <div className='flex justify-between items-center mb-4'>
                  <TabsList>
                    <TabsTrigger value='appointments'>Cuộc hẹn</TabsTrigger>
                    <TabsTrigger value='ratings'>Đánh giá</TabsTrigger>
                  </TabsList>
                  <DateRangePicker onChange={setDateRange} />
                </div>

                <TabsContent value='appointments'>
                  <Card>
                    <CardContent className='pt-6'>
                      <ReactECharts
                        option={getBarChartOptions(appointmentChartData)}
                        style={{ height: '350px' }}
                        opts={{ renderer: 'svg' }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='ratings'>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex flex-col md:flex-row md:gap-8'>
                        <div className='flex flex-col items-center mb-6 md:mb-0 md:w-1/3'>
                          <span className='text-4xl font-bold'>{ratingData.average}</span>
                          <div className='flex my-2'>{renderStars(Math.round(ratingData.average))}</div>
                          <span className='text-sm text-muted-foreground'>Dựa trên {ratingData.total} đánh giá</span>
                        </div>

                        <div className='md:w-2/3'>
                          {ratingData.distribution.map((item) => (
                            <div key={item.stars} className='flex items-center mb-2'>
                              <div className='w-12 text-sm'>{item.stars} sao</div>
                              <div className='flex-1 mx-2'>
                                <Progress value={item.percentage} className='h-2' />
                              </div>
                              <div className='w-10 text-sm text-right'>{item.percentage}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            <div className='pl-0 md:pl-6 md:border-l border-slate-200'>
              <div className='flex justify-between items-center mb-4 w-full'>
                <p className='text-lg font-medium'>Thống kê cuộc hẹn</p>
              </div>
              <p className='mb-4 text-sm text-slate-500'>
                Tỷ lệ hoàn thành cuộc hẹn của bạn cao hơn 15% so với trung bình
              </p>
              <ReactECharts option={getPieChartOptions()} style={{ height: '300px' }} opts={{ renderer: 'svg' }} />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6'>
          <div className='col-span-1'>
            <Tabs defaultValue='doctorStats'>
              <TabsList className='justify-start mb-4 w-full'>
                <TabsTrigger value='doctorStats'>Thống kê bác sĩ</TabsTrigger>
                <TabsTrigger value='userStats'>Thống kê bệnh nhân</TabsTrigger>
              </TabsList>

              <TabsContent value='doctorStats'>
                <Card>
                  <CardContent className='p-0'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên bác sĩ</TableHead>
                          <TableHead>Chuyên khoa</TableHead>
                          <TableHead className='text-right'>Tổng cuộc hẹn</TableHead>
                          <TableHead className='text-right'>Hoàn thành</TableHead>
                          <TableHead className='text-right'>Đã hủy</TableHead>
                          <TableHead className='text-right'>Đánh giá</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctorStatsData.map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell className='font-medium'>
                              <div className='flex gap-2 items-center'>
                                <Avatar className='w-8 h-8'>
                                  <AvatarFallback>
                                    <User2Icon className='w-4 h-4' />
                                  </AvatarFallback>
                                </Avatar>
                                {doctor.name}
                              </div>
                            </TableCell>
                            <TableCell>{doctor.specialty}</TableCell>
                            <TableCell className='text-right'>{doctor.totalAppointments}</TableCell>
                            <TableCell className='text-right text-green-600'>{doctor.completedAppointments}</TableCell>
                            <TableCell className='text-right text-red-600'>{doctor.cancelledAppointments}</TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end items-center'>
                                <span className='mr-1'>{doctor.rating}</span>
                                <StarIcon className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='userStats'>
                <Card>
                  <CardContent className='p-0'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên bệnh nhân</TableHead>
                          <TableHead className='text-right'>Tổng cuộc hẹn</TableHead>
                          <TableHead className='text-right'>Tổng thanh toán</TableHead>
                          <TableHead>Cuộc hẹn gần nhất</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topUsersData.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className='font-medium'>
                              <div className='flex gap-2 items-center'>
                                <Avatar className='w-8 h-8'>
                                  <AvatarFallback>
                                    <User2Icon className='w-4 h-4' />
                                  </AvatarFallback>
                                </Avatar>
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell className='text-right'>{user.totalAppointments}</TableCell>
                            <TableCell className='text-right'>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                user.totalPayments
                              )}
                            </TableCell>
                            <TableCell>{format(new Date(user.lastAppointment), 'dd/MM/yyyy')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className='p-6 mt-6 rounded-lg shadow-sm bg-slate-50'>
          <h2 className='mb-4 text-lg font-medium'>Phản hồi gần đây</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {feedbackData.map((feedback) => (
              <Card key={feedback.id} className='h-full'>
                <CardContent className='p-4'>
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex gap-3 items-start'>
                      <Avatar className='w-10 h-10'>
                        <AvatarImage src={feedback.patient.avatar} />
                        <AvatarFallback>{feedback.patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{feedback.patient.name}</div>
                        <div className='flex mt-1'>{renderStars(feedback.rating)}</div>
                      </div>
                    </div>
                    <div className='text-sm text-muted-foreground'>{format(new Date(feedback.date), 'dd/MM/yyyy')}</div>
                  </div>
                  <p className='text-sm text-slate-600'>{feedback.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
