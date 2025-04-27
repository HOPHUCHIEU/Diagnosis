import React from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { it } from 'node:test'

// Component biểu đồ phân bố trạng thái cuộc hẹn
export const AppointmentStatusChart = ({ data }: { data: any }) => {
  const options = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    // legend: {
    //   orient: 'horizontal',
    //   bottom: 10,
    //   data: data.series.map((item: any) => item.name)
    // },
    legend: {
      show: true,
      itemGap: 5,
      icon: 'circle',
      left: 'right',
      top: 10,
      orient: 'vertical',
      textStyle: {
        fontSize: 14,
        fontFamily: 'roboto'
      },
      data: data.series.map((item: any) => item.name)
    },
    series: [
      {
        name: 'Trạng thái cuộc hẹn',
        type: 'pie',
        radius: ['0%', '70%'],
        avoidLabelOverlap: false,
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        data: data.series
      }
    ],
    center: ['50%', '50%']
  }

  return (
    <>
      {data.series.some((item: any) => item.value > 0) ? (
        <ReactECharts option={options} style={{ height: '360px' }} opts={{ renderer: 'svg' }} />
      ) : (
        <div className='flex items-center justify-center h-[360px] text-center'>
          <p className='text-muted-foreground'>Không có dữ liệu cuộc hẹn trong khoảng thời gian này</p>
        </div>
      )}
    </>
  )
}

// Component biểu đồ số lượng cuộc hẹn theo tháng
export const MonthlyAppointmentsChart = ({ data, dateFilter }: { data: any; dateFilter: string }) => {
  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Hoàn thành', 'Chờ xử lý', 'Đã hủy', 'Tái khám'],
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
        data: data.months
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
        data: data.completed
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
        data: data.pending
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
        data: data.cancelled
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
        data: data.followUp
      }
    ]
  }

  return (
    <>
      {['3months', '6months', '12months'].includes(dateFilter) && data.months.length > 0 ? (
        <ReactECharts option={options} style={{ height: '350px' }} opts={{ renderer: 'svg' }} />
      ) : (
        <div className='flex items-center justify-center h-[350px] text-center'>
          <div>
            <p className='mb-2 text-lg font-medium'>Chọn khoảng thời gian dài hơn</p>
            <p className='text-muted-foreground'>Biểu đồ này yêu cầu dữ liệu từ 3 tháng trở lên</p>
          </div>
        </div>
      )}
    </>
  )
}

// Component biểu đồ top bệnh nhân
export const TopPatientsChart = ({ data }: { data: any }) => {
  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: data.patients,
      axisLabel: {
        width: 100,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: 'Số cuộc hẹn',
        type: 'bar',
        data: data.appointments,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#ffa39e' },
            { offset: 1, color: '#ff7875' }
          ])
        }
      }
    ]
  }

  return (
    <>
      {data.patients.length > 0 ? (
        <ReactECharts option={options} style={{ height: '350px' }} opts={{ renderer: 'svg' }} />
      ) : (
        <div className='flex items-center justify-center h-[350px] text-center'>
          <p className='text-muted-foreground'>Không có dữ liệu bệnh nhân trong khoảng thời gian này</p>
        </div>
      )}
    </>
  )
}
