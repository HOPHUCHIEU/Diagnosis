import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import DoctorSchedule from './components/DoctorSchedule'
import { generateTimeSlots } from '@/utils/schedule'
import BookingDialog from './components/BookingDialog'
import { useAppSelector } from '@/redux/store'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { formatCurrency } from '@/utils/utils'
import { Page_403 } from '@/pages/NotFound'
import {
  useGetPublicDoctorProfileQuery,
  useGetPublicDoctorScheduleQuery,
  useGetDoctorReviewsQuery
} from '@/redux/services/publicApi'
import path from '@/constants/path'
import { WeekSchedule } from '@/types/workSchedule.type'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DoctorReviewList from '@/components/Review/DoctorReviewList'
import {
  Star,
  Users,
  Award,
  Languages,
  GraduationCap,
  Calendar,
  MapPin,
  Clock,
  Stethoscope,
  RefreshCcw,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface LocationState {
  bookingData?: {
    date: string
    timeSlot: string
  }
  autoOpenBooking?: boolean
  from?: string
  message?: string
}

interface AvailableShift {
  startTime: string
  endTime: string
}

export default function DoctorProfile() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.authState.isAuthenticated)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [showBooking, setShowBooking] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('info')

  // Get first and last day of current month for schedule
  const startDate = format(startOfMonth(selectedDate), 'yyyy-M-d')
  const endDate = format(endOfMonth(selectedDate), 'yyyy-M-d')

  const { data: doctorProfile, isLoading: isLoadingDoctor } = useGetPublicDoctorProfileQuery(doctorId || '')
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    refetch: refetchSchedule
  } = useGetPublicDoctorScheduleQuery(
    {
      id: doctorId || '',
      startDate,
      endDate,
      includeAll: true
    },
    {
      skip: !doctorId
    }
  )

  const { data: reviewsData, isLoading: isLoadingReviews } = useGetDoctorReviewsQuery(
    {
      id: doctorId || '',
      page: 1,
      limit: 1
    },
    {
      skip: !doctorId
    }
  )

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!scheduleData?.data?.length) return []

    // Find schedule for selected date
    const daySchedule = scheduleData.data.find((schedule) => {
      // Xử lý vấn đề múi giờ bằng cách chỉ so sánh năm, tháng, ngày
      const scheduleDate = new Date(schedule.date)
      const scheduleYear = scheduleDate.getUTCFullYear()
      const scheduleMonth = scheduleDate.getUTCMonth()
      const scheduleDay = scheduleDate.getUTCDate()

      const selectedYear = selectedDate.getFullYear()
      const selectedMonth = selectedDate.getMonth()
      const selectedDay = selectedDate.getDate()

      return scheduleYear === selectedYear && scheduleMonth === selectedMonth && scheduleDay === selectedDay
    })

    if (!daySchedule) return []

    const availableShifts: AvailableShift[] = []

    // Check each shift
    if (daySchedule.schedules.morning && daySchedule.schedules.morningApprovalStatus === 'approved') {
      const startTime = daySchedule.schedules.morningStart
      const endTime = daySchedule.schedules.morningEnd
      if (startTime && endTime) {
        availableShifts.push({ startTime, endTime })
      }
    }

    if (daySchedule.schedules.afternoon && daySchedule.schedules.afternoonApprovalStatus === 'approved') {
      const startTime = daySchedule.schedules.afternoonStart
      const endTime = daySchedule.schedules.afternoonEnd
      if (startTime && endTime) {
        availableShifts.push({ startTime, endTime })
      }
    }

    if (daySchedule.schedules.evening && daySchedule.schedules.eveningApprovalStatus === 'approved') {
      const startTime = daySchedule.schedules.eveningStart
      const endTime = daySchedule.schedules.eveningEnd
      if (startTime && endTime) {
        availableShifts.push({ startTime, endTime })
      }
    }

    // Generate time slots for all available shifts
    return availableShifts.flatMap((shift) =>
      generateTimeSlots(shift.startTime, shift.endTime, daySchedule.defaultConsultationDuration || 30)
    )
  }

  const timeSlots = getAvailableTimeSlots()

  const handleTimeSlotClick = (timeSlot: string) => {
    if (!isAuthenticated) {
      // Save booking intent to sessionStorage
      const bookingIntent = {
        doctorId,
        date: selectedDate,
        timeSlot
      }
      sessionStorage.setItem('bookingIntent', JSON.stringify(bookingIntent))
      toast.info(CustomNotification, {
        data: {
          title: 'Thông báo!',
          content: 'Vui lòng đăng nhập để đặt lịch khám'
        }
      })
      navigate(path.signin, {
        state: {
          from: `/doctor/${doctorId}`,
          message: 'Vui lòng đăng nhập để đặt lịch khám'
        }
      })
      return
    }

    setSelectedTimeSlot(timeSlot)
    setShowBooking(true)
  }

  // Add effect to handle auto-open booking after login
  useEffect(() => {
    const state = location.state as LocationState

    if (state?.bookingData && state.autoOpenBooking) {
      const { date, timeSlot } = state.bookingData
      setSelectedDate(new Date(date))
      setSelectedTimeSlot(timeSlot)
      setShowBooking(true)

      // Clear the state
      navigate(location.pathname, { replace: true })
    }
  }, [location])

  const isLoading = isLoadingDoctor || isLoadingSchedule || isLoadingReviews
  if (!doctorProfile) return <Page_403 />

  // Lấy thông tin đánh giá
  const reviewStats = reviewsData?.data.stats
  const hasReviews = !!reviewStats && reviewStats.totalReviews > 0

  const handleBookingSuccess = () => {
    // Refetch schedule data
    refetchSchedule()

    // Tự động refetch thông qua việc set lại selectedDate
    // Điều này sẽ kích hoạt useEffect trong DoctorSchedule
    const newDate = new Date(selectedDate)
    setSelectedDate(newDate)

    // Hiển thị thông báo thành công
    // toast.success(CustomNotification, {
    //   data: {
    //     title: 'Cập nhật!',
    //     content: 'Lịch đặt khám đã được cập nhật'
    //   }
    // })
  }

  return (
    <div className='container py-8'>
      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='overflow-hidden lg:col-span-2'>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='p-6 space-y-4'>
                <Skeleton className='w-32 h-32 rounded-full' />
                <Skeleton className='w-48 h-6' />
                <Skeleton className='w-full h-24' />
              </div>
            ) : (
              <div>
                {/* Header banner */}
                <div className='h-32 bg-gradient-to-br from-primary/90 to-primary/20' />

                <div className='px-6 pb-6 space-y-6'>
                  <div className='flex flex-col items-center gap-6 -mt-16 md:flex-row md:items-start'>
                    <Avatar className='w-32 h-32 bg-white border-4 border-white shadow-md'>
                      <AvatarImage src={doctorProfile?.data.profileImage || doctorProfile?.data.profileImage} />
                      <AvatarFallback className='text-2xl'>
                        {doctorProfile?.data?.doctorName?.substring(0, 2) || 'BS'}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 pt-2 text-center md:text-left'>
                      <h1 className='text-2xl font-bold'>
                        {`${doctorProfile?.data?.doctor.profile.firstName} ${doctorProfile?.data?.doctor.profile.lastName}` ||
                          'Tên đầy đủ Doctor'}
                      </h1>

                      <div className='flex flex-wrap justify-center gap-2 mt-2 md:justify-start'>
                        {doctorProfile?.data.specialties.map((specialty) => (
                          <Button size='sm' key={specialty} className='py-1 text-xs h-fit' effect='shine'>
                            <Stethoscope className='w-3 h-3 mr-1' />
                            {specialty}
                          </Button>
                        ))}
                      </div>

                      <div className='flex flex-wrap justify-center gap-2 mt-3 md:justify-start'>
                        <Badge variant='outline' className='px-3 py-1 text-green-600 bg-green-50'>
                          {doctorProfile?.data.isAvailable ? 'Đang làm việc' : 'Tạm nghỉ'}
                        </Badge>
                        <Badge variant='outline' className='px-3 py-1'>
                          <Clock className='w-3 h-3 mr-1' />
                          {doctorProfile?.data.yearsOfExperience} năm kinh nghiệm
                        </Badge>
                        {/* <Badge variant='outline' className='px-3 py-1'>
                          {formatCurrency(doctorProfile?.data.consultationFee || 0)}/lượt
                        </Badge> */}

                        {hasReviews && (
                          <Badge variant='outline' className='flex items-center gap-1 px-3 py-1'>
                            <div className='flex'>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.round(reviewStats.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <span className='ml-1'>{reviewStats.averageRating.toFixed(1)}</span>
                            <span className='text-xs text-gray-500'>({reviewStats.totalReviews})</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue='info' className='w-full' onValueChange={setActiveTab} value={activeTab}>
                    <TabsList className='grid w-full grid-cols-2 p-1 rounded-lg bg-muted/50'>
                      <TabsTrigger value='info'>Thông tin bác sĩ</TabsTrigger>
                      <TabsTrigger value='reviews'>
                        {hasReviews ? `Đánh giá (${reviewStats.totalReviews})` : 'Đánh giá'}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value='info' className='mt-6'>
                      <div className='space-y-6'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 text-primary'>
                            <Users className='w-5 h-5' />
                            <h2 className='text-lg font-semibold'>Giới thiệu</h2>
                          </div>
                          <div className='pl-7'>
                            <p className='text-gray-600'>{doctorProfile?.data.biography}</p>
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 text-primary'>
                            <Languages className='w-5 h-5' />
                            <h2 className='text-lg font-semibold'>Ngôn ngữ</h2>
                          </div>
                          <div className='flex flex-wrap gap-2 pl-7'>
                            {doctorProfile?.data.languages.map((language) => (
                              <Badge key={language} variant='outline'>
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 text-primary'>
                            <Award className='w-5 h-5' />
                            <h2 className='text-lg font-semibold'>Thành tựu</h2>
                          </div>
                          <ul className='space-y-1 text-gray-600 list-disc pl-7'>
                            {doctorProfile?.data.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value='reviews' className='mt-6'>
                      <DoctorReviewList doctorId={doctorId || ''} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <Card className='overflow-hidden'>
            <CardHeader className='pb-3 bg-primary/5'>
              <div className='flex items-center gap-2'>
                <GraduationCap className='w-5 h-5 text-primary' />
                <CardTitle>Học vấn</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-5'>
              {isLoading ? (
                <div className='space-y-4'>
                  {[1, 2].map((i) => (
                    <div key={i} className='space-y-2'>
                      <Skeleton className='w-40 h-5' />
                      <Skeleton className='w-full h-4' />
                      <Skeleton className='w-3/4 h-4' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-6 divide-y'>
                  {doctorProfile?.data.education.map((edu, index) => (
                    <div key={index} className={`space-y-1 ${index > 0 ? 'pt-4' : ''}`}>
                      <div className='font-medium text-primary'>{edu.degree}</div>
                      <div className='text-sm text-gray-700'>{edu.university}</div>
                      <div className='text-sm text-gray-500'>
                        Chuyên ngành: {edu.specialization} ({edu.graduationYear})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='overflow-hidden'>
            <CardHeader className='pb-3 bg-primary/5'>
              <div className='flex items-center gap-2'>
                <Award className='w-5 h-5 text-primary' />
                <CardTitle>Chứng chỉ</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-5'>
              {isLoading ? (
                <div className='space-y-4'>
                  {[1, 2].map((i) => (
                    <div key={i} className='p-3 space-y-2 border rounded-lg'>
                      <Skeleton className='w-40 h-5' />
                      <Skeleton className='w-3/4 h-4' />
                    </div>
                  ))}
                </div>
              ) : (
                <ScrollArea className='h-[200px] pr-4'>
                  <div className='space-y-4'>
                    {doctorProfile?.data.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className='p-3 transition-colors border border-gray-100 rounded-lg hover:border-primary/20'
                      >
                        <div className='font-medium text-primary'>{cert.name}</div>
                        <div className='text-sm text-gray-700'>Cấp bởi: {cert.issuedBy}</div>
                        <div className='text-sm text-gray-500'>
                          {format(new Date(cert.issueDate), 'MM/yyyy')} -
                          {cert.expiryDate ? format(new Date(cert.expiryDate), 'MM/yyyy') : 'Không thời hạn'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation='vertical' />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className='mt-6 overflow-hidden'>
        <CardHeader className='flex flex-row items-center justify-between pb-3 bg-primary/5'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-primary' />
            <CardTitle>Lịch khám bệnh</CardTitle>
          </div>
          <Button className='!mt-0 w-fit group' variant='outline' onClick={refetchSchedule}>
            Cập nhật lịch khám <RefreshCw className='group-hover:animate-spin' />
          </Button>
        </CardHeader>
        <CardContent className='p-6'>
          <DoctorSchedule
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            timeSlots={timeSlots}
            onTimeSlotSelect={handleTimeSlotClick}
            isLoading={isLoading}
            doctorId={doctorId || ''}
          />
        </CardContent>
      </Card>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className='max-w-5xl min-h-[70vh]'>
          <BookingDialog
            doctorId={doctorId!}
            doctorProfileId={doctorProfile.data.doctor._id!}
            date={selectedDate}
            timeSlot={selectedTimeSlot}
            onClose={() => setShowBooking(false)}
            onBookingSuccess={handleBookingSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
