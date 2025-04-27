import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactECharts from 'echarts-for-react'
import { useGetAllAppointmentsQuery } from '@/redux/services/appointmentApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { subMonths, format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns'
import { Appointment } from '@/types/appointment.type'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const MonthlyAppointmentsChart = () => {
  const [dateFilter, setDateFilter] = useState('3months') // 3 tháng, 6 tháng hoặc 12 tháng

  // Lấy tất cả cuộc hẹn
  const { data: appointmentsData, isLoading } = useGetAllAppointmentsQuery({
    page: 1,
    limit: 500 // Lấy số lượng lớn để bao quát đủ dữ liệu
  })

  // Tính toán khoảng thời gian dựa trên filter
  const dateRange = useMemo(() => {
    const now = new Date()
    const monthsBack = parseInt(dateFilter)
    return {
      start: subMonths(now, monthsBack),
      end: now
    }
  }, [dateFilter])

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = useMemo(() => {
    if (!appointmentsData?.data?.appointments) {
      return {
        months: [],
        completed: [],
        confirmed: [],
        pending: [],
        cancelled: [],
        followUp: []
      }
    }

    const appointments = appointmentsData.data.appointments

    // In dữ liệu để debug (có thể xóa sau khi sửa xong)
    console.log('Tổng số lịch hẹn:', appointments.length)
    console.log('Số lịch hẹn confirmed:', appointments.filter((app) => app.status === 'confirmed').length)
    console.log('Số lịch hẹn completed:', appointments.filter((app) => app.status === 'completed').length)
    console.log('Số lịch hẹn cancelled:', appointments.filter((app) => app.status === 'cancelled').length)
    console.log('Số lịch hẹn pending:', appointments.filter((app) => app.status === 'pending').length)
    console.log(
      'Số lịch hẹn có followUp:',
      appointments.filter((app) => app.followUpAppointments && app.followUpAppointments.length > 0).length
    )

    // Lọc các cuộc hẹn trong khoảng thời gian đã chọn
    const filteredAppointments = appointments.filter((app) => {
      const appDate = new Date(app.appointmentDate)
      return isWithinInterval(appDate, {
        start: dateRange.start,
        end: dateRange.end
      })
    })

    console.log('Số lịch hẹn trong khoảng thời gian:', filteredAppointments.length)

    // Tạo mảng các tháng trong khoảng thời gian
    const months = []
    const completed = []
    const confirmed = []
    const pending = []
    const cancelled = []
    const followUp = []

    // Tính từ tháng bắt đầu đến tháng kết thúc
    let currentMonth = startOfMonth(dateRange.start)
    const endDate = endOfMonth(dateRange.end)

    while (currentMonth <= endDate) {
      const monthLabel = format(currentMonth, 'MM/yyyy')
      months.push(monthLabel)

      // Đếm số lượng cuộc hẹn cho mỗi trạng thái trong tháng
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)

      const monthAppointments = filteredAppointments.filter((app) => {
        const appDate = new Date(app.appointmentDate)
        return isWithinInterval(appDate, { start: monthStart, end: monthEnd })
      })

      // In dữ liệu để debug (có thể xóa sau khi sửa xong)
      console.log(`Tháng ${monthLabel}:`, {
        total: monthAppointments.length,
        completed: monthAppointments.filter((app) => app.status === 'completed').length,
        confirmed: monthAppointments.filter((app) => app.status === 'confirmed').length,
        pending: monthAppointments.filter((app) => app.status === 'pending').length,
        cancelled: monthAppointments.filter((app) => app.status === 'cancelled').length,
        followUp: monthAppointments.filter((app) => app.followUpAppointments && app.followUpAppointments.length > 0)
          .length
      })

      completed.push(monthAppointments.filter((app) => app.status === 'completed').length)
      confirmed.push(monthAppointments.filter((app) => app.status === 'confirmed').length)
      pending.push(monthAppointments.filter((app) => app.status === 'pending').length)
      cancelled.push(monthAppointments.filter((app) => app.status === 'cancelled').length)
      followUp.push(
        monthAppointments.filter((app) => app.followUpAppointments && app.followUpAppointments.length > 0).length
      )

      // Chuyển đến tháng tiếp theo
      currentMonth = new Date(currentMonth)
      currentMonth.setMonth(currentMonth.getMonth() + 1)
    }

    return {
      months,
      completed,
      confirmed,
      pending,
      cancelled,
      followUp
    }
  }, [appointmentsData, dateRange])

  // Cấu hình biểu đồ
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Hoàn thành', 'Đã xác nhận', 'Chờ xử lý', 'Đã hủy', 'Tái khám'],
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
        data: chartData.months
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
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#22c55e' // green-500
        },
        data: chartData.completed
      },
      {
        name: 'Đã xác nhận',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#3b82f6' // blue-500
        },
        data: chartData.confirmed
      },
      {
        name: 'Chờ xử lý',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#f59e0b' // amber-500
        },
        data: chartData.pending
      },
      {
        name: 'Đã hủy',
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#ef4444' // red-500
        },
        data: chartData.cancelled
      },
      {
        name: 'Tái khám',
        type: 'line',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#8b5cf6' // violet-500
        },
        data: chartData.followUp
      }
    ]
  }

  return (
    <Card className='shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center space-x-2'>
          <CardTitle>Thống kê cuộc hẹn theo thời gian</CardTitle>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className='w-4 h-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent>
                <p>Biểu đồ hiển thị thống kê các lịch hẹn của hệ thống tính đến thời gian hiện tại</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Chọn khoảng thời gian' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='3months'>3 tháng gần đây</SelectItem>
            <SelectItem value='6months'>6 tháng gần đây</SelectItem>
            <SelectItem value='12months'>12 tháng gần đây</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='pt-0'>
        {isLoading ? (
          <div className='flex items-center justify-center h-[350px]'>
            <Skeleton className='w-full h-[300px]' />
          </div>
        ) : chartData.months.length > 0 ? (
          <ReactECharts option={chartOptions} style={{ height: '350px' }} opts={{ renderer: 'svg' }} />
        ) : (
          <div className='flex items-center justify-center h-[350px] text-center'>
            <div>
              <p className='mb-2 text-lg font-medium'>Không có dữ liệu</p>
              <p className='text-muted-foreground'>Không tìm thấy dữ liệu cuộc hẹn trong khoảng thời gian này</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MonthlyAppointmentsChart
