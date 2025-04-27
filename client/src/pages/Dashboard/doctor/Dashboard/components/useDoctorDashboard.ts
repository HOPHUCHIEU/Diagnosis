import { useMemo } from 'react'
import { useGetAllAppointmentsQuery } from '@/redux/services/appointmentApi'
import { useGetDoctorScheduleQuery } from '@/redux/services/workScheduleApi'
import { useGetDoctorReviewsQuery } from '@/redux/services/publicApi'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { bufferToHex } from '@/utils/utils'
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'

// Hàm lấy phạm vi ngày từ bộ lọc
export const getDateRangeFromFilter = (filter: string): { from: Date; to: Date } => {
  const to = new Date()
  let from: Date

  switch (filter) {
    case '3months':
      from = subMonths(to, 3)
      break
    case '6months':
      from = subMonths(to, 6)
      break
    case '12months':
      from = subMonths(to, 12)
      break
    default:
      from = subDays(to, 30)
  }

  return { from, to }
}

export const useDoctorDashboard = (dateFilter: string) => {
  const { user } = useSelector((state: RootState) => state.authState)
  const doctorId = bufferToHex(user?.doctorProfileId) || ''
  const dateRange = getDateRangeFromFilter(dateFilter)

  const today = new Date()
  const currentMonthStart = startOfMonth(today)
  const currentMonthEnd = endOfMonth(today)
  const lastMonthStart = startOfMonth(subMonths(today, 1))
  const lastMonthEnd = endOfMonth(subMonths(today, 1))

  // Format dates for reference
  const currentMonthStartFormatted = format(currentMonthStart, 'yyyy-MM-dd')
  const currentMonthEndFormatted = format(currentMonthEnd, 'yyyy-MM-dd')

  // Lấy tất cả cuộc hẹn
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useGetAllAppointmentsQuery({
    page: 1,
    limit: 500
  })

  // Lấy lịch làm việc
  const { data: scheduleData, isLoading: isLoadingSchedule } = useGetDoctorScheduleQuery({
    id: doctorId,
    startDate: currentMonthStartFormatted,
    endDate: currentMonthEndFormatted,
    includeAll: true
  })

  // Lấy danh sách các đánh giá
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetDoctorReviewsQuery(
    {
      id: doctorId,
      page: 1,
      limit: 100
    },
    {
      refetchOnMountOrArgChange: true
    }
  )

  // Lọc cuộc hẹn theo khoảng thời gian đã chọn
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData?.data?.appointments) return []

    return appointmentsData.data.appointments.filter((app) => {
      const appDate = new Date(app.appointmentDate)
      return appDate >= dateRange.from && appDate <= dateRange.to
    })
  }, [appointmentsData, dateRange])

  // Lọc cuộc hẹn cho tháng hiện tại
  const currentMonthAppointments = useMemo(() => {
    if (!appointmentsData?.data?.appointments) return []

    return appointmentsData.data.appointments.filter((app) => {
      const appDate = new Date(app.appointmentDate)
      return appDate >= currentMonthStart && appDate <= currentMonthEnd
    })
  }, [appointmentsData, currentMonthStart, currentMonthEnd])

  // Lọc cuộc hẹn cho tháng trước
  const lastMonthAppointments = useMemo(() => {
    if (!appointmentsData?.data?.appointments) return []

    return appointmentsData.data.appointments.filter((app) => {
      const appDate = new Date(app.appointmentDate)
      return appDate >= lastMonthStart && appDate <= lastMonthEnd
    })
  }, [appointmentsData, lastMonthStart, lastMonthEnd])

  // Thống kê về cuộc hẹn
  const appointmentStats = useMemo(() => {
    if (!filteredAppointments.length) {
      return {
        total: 0,
        approved: 0,
        cancelled: 0,
        completed: 0,
        pending: 0,
        followUp: 0
      }
    }
    console.log('filteredAppointments', filteredAppointments)
    const total = filteredAppointments.length
    const approved = filteredAppointments.filter((app) => app.status === 'confirmed').length
    const completed = filteredAppointments.filter((app) => app.status === 'completed').length
    const followUp = filteredAppointments.filter((app) => app?.followUpAppointments?.length > 0)?.length
    console.log('followUp', followUp)
    const pending = filteredAppointments.filter((app) => app.status === 'pending').length
    const cancelled = filteredAppointments.filter((app) => app.status === 'cancelled').length

    return { total, approved, cancelled, completed, followUp, pending }
  }, [filteredAppointments])

  // So sánh số lượng cuộc hẹn giữa tháng này và tháng trước
  const appointmentTrend = useMemo(() => {
    if (!currentMonthAppointments.length && !lastMonthAppointments.length) {
      return {
        totalChange: 0,
        completedChange: 0
      }
    }

    const currentTotal = currentMonthAppointments.length
    const lastTotal = lastMonthAppointments.length
    const totalChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 100

    const currentCompleted = currentMonthAppointments.filter((app) => app.status === 'completed').length
    const lastCompleted = lastMonthAppointments.filter((app) => app.status === 'completed').length
    const completedChange = lastCompleted > 0 ? ((currentCompleted - lastCompleted) / lastCompleted) * 100 : 100

    return { totalChange, completedChange }
  }, [currentMonthAppointments, lastMonthAppointments])

  // Thống kê về lịch làm việc
  const workScheduleStats = useMemo(() => {
    if (!scheduleData?.data) {
      return {
        thisWeek: 0,
        thisMonth: 0,
        todaySchedule: null
      }
    }

    try {
      const schedules = scheduleData.data

      // Lịch làm việc hôm nay
      const todaySchedule = schedules.find((schedule) => {
        const scheduleDate = parseISO(schedule.date)
        return (
          scheduleDate.getFullYear() === today.getFullYear() &&
          scheduleDate.getMonth() === today.getMonth() &&
          scheduleDate.getDate() === today.getDate()
        )
      })

      // Số ngày làm việc trong tuần này
      const weekStart = startOfWeek(today, { locale: vi })
      const weekEnd = endOfWeek(today, { locale: vi })
      const thisWeekWorkdays = schedules.filter((schedule) => {
        const scheduleDate = parseISO(schedule.date)
        return scheduleDate >= weekStart && scheduleDate <= weekEnd
      }).length

      // Số ngày làm việc trong tháng
      const thisMonthWorkdays = schedules.length

      return {
        thisWeek: thisWeekWorkdays,
        thisMonth: thisMonthWorkdays,
        todaySchedule
      }
    } catch (error) {
      console.error('Error processing schedule data:', error)
      return {
        thisWeek: 0,
        thisMonth: 0,
        todaySchedule: null
      }
    }
  }, [scheduleData, today])

  // Thống kê về đánh giá
  const reviewStats = useMemo(() => {
    if (!reviewsData?.data) {
      return {
        average: 0,
        total: 0,
        distribution: [
          { stars: 5, count: 0, percentage: 0 },
          { stars: 4, count: 0, percentage: 0 },
          { stars: 3, count: 0, percentage: 0 },
          { stars: 2, count: 0, percentage: 0 },
          { stars: 1, count: 0, percentage: 0 }
        ],
        recentReviews: []
      }
    }

    try {
      const reviews = reviewsData.data.reviews || []
      const { stats } = reviewsData.data
      const average = stats?.averageRating || 0
      const total = stats?.totalReviews || 0

      // Phân phối số lượng đánh giá theo số sao
      const distribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((review) => review.rating === stars).length
        const percentage = total > 0 ? (count / total) * 100 : 0
        return { stars, count, percentage }
      })

      // Lấy 3 đánh giá gần nhất
      const recentReviews = [...reviews]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)

      return { average, total, distribution, recentReviews }
    } catch (error) {
      console.error('Error processing review data:', error)
      return {
        average: 0,
        total: 0,
        distribution: [
          { stars: 5, count: 0, percentage: 0 },
          { stars: 4, count: 0, percentage: 0 },
          { stars: 3, count: 0, percentage: 0 },
          { stars: 2, count: 0, percentage: 0 },
          { stars: 1, count: 0, percentage: 0 }
        ],
        recentReviews: []
      }
    }
  }, [reviewsData])

  // Chuẩn bị dữ liệu cho các biểu đồ
  const chartData = useMemo(() => {
    // Biểu đồ phân bố trạng thái cuộc hẹn
    const appointmentStatus = (() => {
      if (!filteredAppointments.length) {
        return {
          series: [
            { value: 0, name: 'Hoàn thành', itemStyle: { color: '#22c55e' } },
            { value: 0, name: 'Đã xác nhận', itemStyle: { color: '#3b82f6' } },
            { value: 0, name: 'Chờ xác nhận', itemStyle: { color: '#f59e0b' } },
            { value: 0, name: 'Đã hủy', itemStyle: { color: '#ef4444' } }
          ]
        }
      }

      try {
        const completed = filteredAppointments.filter((app) => app.status === 'completed').length
        const confirmed = filteredAppointments.filter((app) => app.status === 'confirmed').length
        const pending = filteredAppointments.filter((app) => app.status === 'pending').length
        const cancelled = filteredAppointments.filter((app) => app.status === 'cancelled').length

        return {
          series: [
            { value: completed, name: 'Hoàn thành', itemStyle: { color: '#22c55e' } },
            { value: confirmed, name: 'Đã xác nhận', itemStyle: { color: '#3b82f6' } },
            { value: pending, name: 'Chờ xác nhận', itemStyle: { color: '#f59e0b' } },
            { value: cancelled, name: 'Đã hủy', itemStyle: { color: '#ef4444' } }
          ]
        }
      } catch (error) {
        console.error('Error processing appointment status data:', error)
        return {
          series: [
            { value: 0, name: 'Hoàn thành', itemStyle: { color: '#22c55e' } },
            { value: 0, name: 'Đã xác nhận', itemStyle: { color: '#3b82f6' } },
            { value: 0, name: 'Chờ xác nhận', itemStyle: { color: '#f59e0b' } },
            { value: 0, name: 'Đã hủy', itemStyle: { color: '#ef4444' } }
          ]
        }
      }
    })()

    // Biểu đồ số lượng cuộc hẹn theo tháng
    const monthlyAppointments = (() => {
      if (!appointmentsData?.data?.appointments) {
        return { months: [], completed: [], pending: [], cancelled: [], followUp: [] }
      }

      try {
        // Nếu filter là 3 tháng trở lên, mới hiển thị biểu đồ theo tháng
        if (!['3months', '6months', '12months'].includes(dateFilter)) {
          return { months: [], completed: [], pending: [], cancelled: [], followUp: [] }
        }

        const appointments = appointmentsData.data.appointments

        // Tạo mảng các tháng trong khoảng thời gian đã chọn
        const numberOfMonths = dateFilter === '3months' ? 3 : dateFilter === '6months' ? 6 : 12
        const months: string[] = []
        const completedData: number[] = []
        const pendingData: number[] = []
        const cancelledData: number[] = []
        const followUpData: number[] = []

        for (let i = 0; i < numberOfMonths; i++) {
          const month = subMonths(today, numberOfMonths - 1 - i)
          const monthLabel = format(month, 'MM/yyyy')
          months.push(monthLabel)

          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)

          // Lọc cuộc hẹn trong tháng này
          const monthAppointments = appointments.filter((app) => {
            const appDate = new Date(app.appointmentDate)
            return appDate >= monthStart && appDate <= monthEnd
          })

          completedData.push(monthAppointments.filter((app) => app.status === 'completed').length)
          pendingData.push(monthAppointments.filter((app) => ['pending', 'confirmed'].includes(app.status)).length)
          cancelledData.push(monthAppointments.filter((app) => app.status === 'cancelled').length)
          followUpData.push(monthAppointments.filter((app) => app.followUpAppointments.length > 0).length)
        }

        return {
          months,
          completed: completedData,
          pending: pendingData,
          cancelled: cancelledData,
          followUp: followUpData
        }
      } catch (error) {
        console.error('Error processing monthly appointments data:', error)
        return { months: [], completed: [], pending: [], cancelled: [], followUp: [] }
      }
    })()

    // Biểu đồ top bệnh nhân thường xuyên khám
    const topPatients = (() => {
      if (!filteredAppointments.length) {
        return { patients: [], appointments: [] }
      }

      try {
        // Nhóm cuộc hẹn theo bệnh nhân
        const patientAppointments: Record<string, { name: string; count: number }> = {}

        filteredAppointments.forEach((app) => {
          if (!app.patient || !app.patient.profile) return

          const patientId = bufferToHex(app.patient._id)
          const patientName = `${app.patient.profile.firstName} ${app.patient.profile.lastName}`

          if (!patientAppointments[patientId]) {
            patientAppointments[patientId] = { name: patientName, count: 0 }
          }

          patientAppointments[patientId].count++
        })

        // Sắp xếp và lấy top 5 bệnh nhân
        const topPatients = Object.values(patientAppointments)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        return {
          patients: topPatients.map((p) => p.name),
          appointments: topPatients.map((p) => p.count)
        }
      } catch (error) {
        console.error('Error processing top patients data:', error)
        return { patients: [], appointments: [] }
      }
    })()

    return {
      appointmentStatus,
      monthlyAppointments,
      topPatients
    }
  }, [filteredAppointments, appointmentsData, dateFilter, today])
  console.log('appointmentStats', appointmentStats)
  return {
    doctorId,
    appointmentStats,
    appointmentTrend,
    workScheduleStats,
    reviewStats,
    chartData,
    isLoading: isLoadingAppointments || isLoadingSchedule || isLoadingReviews,
    today
  }
}
