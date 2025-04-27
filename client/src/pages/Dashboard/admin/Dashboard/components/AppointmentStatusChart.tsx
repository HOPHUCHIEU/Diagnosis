import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactECharts from 'echarts-for-react'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AppointmentStatusChartProps {
  appointmentStatusBreakdown: {
    cancelled: number
    confirmed: number
    completed: number
  }
}

const AppointmentStatusChart = ({ appointmentStatusBreakdown }: AppointmentStatusChartProps) => {
  const options = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 0,
      data: ['Đã hủy', 'Đã xác nhận', 'Đã hoàn thành']
    },
    series: [
      {
        name: 'Trạng thái cuộc hẹn',
        type: 'pie',
        radius: ['0%', '80%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: appointmentStatusBreakdown.cancelled,
            name: 'Đã hủy',
            itemStyle: { color: '#ef4444' }
          },
          {
            value: appointmentStatusBreakdown.confirmed,
            name: 'Đã xác nhận',
            itemStyle: { color: '#3b82f6' }
          },
          {
            value: appointmentStatusBreakdown.completed,
            name: 'Đã hoàn thành',
            itemStyle: { color: '#10b981' }
          }
        ]
      }
    ]
  }

  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <div className='flex items-center space-x-2'>
          <CardTitle>Thống kê trạng thái cuộc hẹn</CardTitle>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <HelpCircle className='w-4 h-4 text-muted-foreground cursor-help' />
              </TooltipTrigger>
              <TooltipContent>
                <p>Biểu đồ hiển thị thống kê tất cả lịch hẹn của hệ thống từ trước đến nay</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[320px]'>
          <ReactECharts option={options} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        </div>
      </CardContent>
    </Card>
  )
}

export default AppointmentStatusChart
