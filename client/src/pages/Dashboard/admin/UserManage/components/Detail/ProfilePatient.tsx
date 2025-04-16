import { useState, useEffect } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  useGetPatientRecordQuery,
  useCreatePatientRecordMutation,
  useUpdatePatientRecordMutation
} from '@/redux/services/patientApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { format } from 'date-fns'
import { User } from '@/types/user.type'
import { patientRecordSchema, type PatientRecordSchema } from '@/utils/rules'
import { bufferToHex } from '@/utils/utils'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Pencil,
  UserCircle,
  ClipboardList,
  HeartPulse,
  Activity,
  Phone,
  Shield,
  BriefcaseMedical,
  Copy
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { BLOOD_TYPES, RELATIONSHIPS, INSURANCE_PROVIDERS } from '@/constants/schedules.patient'
import { useGetAllUserQuery, useGetMeQuery } from '@/redux/services/userApi'
import { CreatePatientRecordInput, UpdatePatientRecordInput } from '@/types/patient.type'
import { toast as sonnerToast } from 'sonner'

interface Props {
  user: User
  onClose?: () => void
}

export default function ProfilePatient({ user, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const { refetch: refetchGetAllUser } = useGetAllUserQuery(null)
  const { refetch: refetchGetMe } = useGetMeQuery(null)

  const {
    data: patientRecord,
    isLoading,
    refetch: refetchGetPatientRecord
  } = useGetPatientRecordQuery(user?.patientId ? bufferToHex(user.patientId) : '', {
    skip: !user?.patientId,
    refetchOnMountOrArgChange: true
  })
  const [createRecord, { isLoading: isCreating }] = useCreatePatientRecordMutation()
  const [updateRecord, { isLoading: isUpdating }] = useUpdatePatientRecordMutation()

  const form = useForm<PatientRecordSchema>({
    resolver: yupResolver(patientRecordSchema),
    defaultValues: {
      occupation: '',
      bloodType: 'A+',
      height: 0,
      weight: 0,
      allergies: [],
      chronicDiseases: [],
      familyHistory: '',
      surgeryHistory: '',
      isPregnant: false,
      currentMedications: [],
      lifestyle: {
        smoking: false,
        alcohol: false,
        exercise: '',
        diet: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: 'Khác'
      },
      insurance: {
        number: '',
        provider: 'Bảo hiểm y tế nhà nước',
        expired: new Date().toISOString()
      }
    }
  })

  // Reset form with patient data when entering edit mode or when data changes
  useEffect(() => {
    if (isEditing && patientRecord?.data) {
      form.reset({
        occupation: patientRecord.data.occupation,
        bloodType: patientRecord.data.bloodType,
        height: patientRecord.data.height,
        weight: patientRecord.data.weight,
        allergies: patientRecord.data.allergies,
        chronicDiseases: patientRecord.data.chronicDiseases,
        familyHistory: patientRecord.data.familyHistory,
        surgeryHistory: patientRecord.data.surgeryHistory,
        isPregnant: patientRecord.data.isPregnant,
        currentMedications: patientRecord.data.currentMedications,
        lifestyle: {
          smoking: patientRecord.data.lifestyle.smoking,
          alcohol: patientRecord.data.lifestyle.alcohol,
          exercise: patientRecord.data.lifestyle.exercise,
          diet: patientRecord.data.lifestyle.diet
        },
        emergencyContact: {
          name: patientRecord.data.emergencyContact.name,
          phone: patientRecord.data.emergencyContact.phone,
          relationship: patientRecord.data.emergencyContact.relationship
        },
        insurance: {
          number: patientRecord.data.insurance.number,
          provider: patientRecord.data.insurance.provider,
          expired: patientRecord.data.insurance.expired
        }
      })
    }
  }, [isEditing, patientRecord?.data, form])

  const onSubmit = async (data: PatientRecordSchema) => {
    try {
      if (patientRecord?.data) {
        const formData = { ...data, patient: bufferToHex(user._id) }

        await updateRecord({
          data: formData as UpdatePatientRecordInput
        }).unwrap()
        refetchGetPatientRecord()
        toast.success(CustomNotification, {
          data: { title: 'Thành công!', content: 'Cập nhật hồ sơ bệnh nhân thành công' }
        })
      } else {
        await createRecord({
          ...(data as CreatePatientRecordInput),
          patient: bufferToHex(user._id)
        }).unwrap()
        refetchGetAllUser()
        toast.success(CustomNotification, {
          data: { title: 'Thành công!', content: 'Tạo hồ sơ bệnh nhân thành công' }
        })
        onClose && onClose()
      }
      setIsEditing(false)
    } catch (error: any) {
      console.log('Error:', error)
    } finally {
      user.role === 'user' && refetchGetMe()
    }
  }

  const handleCopyId = () => {
    try {
      const id = bufferToHex(user._id)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(id)
          .then(() => {
            sonnerToast.success('Đã sao chép ID người dùng')
          })
          .catch((err) => {
            console.error('Không thể sao chép:', err)
          })
      }
    } catch (error) {
      console.error('Lỗi khi sao chép ID:', error)
    }
  }

  if (!user?.patientId && !isEditing) {
    return (
      <Card className='w-full'>
        <CardContent className='flex flex-col justify-center items-center p-8 space-y-4'>
          <UserCircle className='w-16 h-16 text-primary/40' />
          <p className='text-center text-gray-500'>Chưa có hồ sơ bệnh nhân</p>
          <Button variant='outline' onClick={() => setIsEditing(true)}>
            <Pencil className='mr-2 w-4 h-4' />
            Tạo hồ sơ
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='w-8 h-8 rounded-full border-b-2 animate-spin border-primary'></div>
      </div>
    )
  }

  const renderField = (label: string, value: string | number | boolean) => {
    return (
      <div className='py-2'>
        <div className='text-sm text-gray-500'>{label}</div>
        <div className='mt-1 font-medium'>{typeof value === 'boolean' ? (value ? 'Có' : 'Không') : value || '—'}</div>
      </div>
    )
  }

  const renderArrayField = (label: string, items: string[] = []) => {
    return (
      <div className='py-2'>
        <div className='text-sm text-gray-500'>{label}</div>
        <div className='flex flex-wrap gap-2 mt-1'>
          {items.length > 0
            ? items.map((item, index) => (
                <Button key={index} effect='shine' size='sm' variant='default'>
                  {item}
                </Button>
              ))
            : '—'}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex gap-2 items-center'>
          <ClipboardList className='w-5 h-5 text-primary' />
          <h2 className='text-xl font-bold'>Hồ sơ bệnh nhân</h2>
        </div>
        <Button variant='outline' size='sm' onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            'Hủy'
          ) : (
            <>
              <Pencil className='mr-2 w-4 h-4' />
              Chỉnh sửa
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Information Card */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                  <UserCircle className='w-5 h-5 text-primary' />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='occupation'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nghề nghiệp</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='bloodType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhóm máu</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn nhóm máu' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='height'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chiều cao (cm)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='weight'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cân nặng (kg)</FormLabel>
                        <FormControl>
                          <Input type='number' {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='isPregnant'
                  render={({ field }) => (
                    <FormItem className='flex gap-2 items-center space-y-0'>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className='font-normal cursor-pointer'>Đang mang thai</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Health Information Card */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                  <HeartPulse className='w-5 h-5 text-primary' />
                  Thông tin sức khỏe
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 space-y-6'>
                <div className='grid gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='allergies'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dị ứng</FormLabel>
                        <FormControl>
                          <div className='space-y-2'>
                            <Input
                              placeholder='Nhập dị ứng và nhấn Enter để thêm'
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const target = e.target as HTMLInputElement
                                  if (target.value.trim()) {
                                    field.onChange([...field.value, target.value.trim()])
                                    target.value = ''
                                  }
                                }
                              }}
                            />
                            <div className='flex flex-wrap gap-2'>
                              {field.value?.map((item, index) => (
                                <Button
                                  key={index}
                                  variant='secondary'
                                  size='sm'
                                  onClick={() => {
                                    const newItems = [...field.value]
                                    newItems.splice(index, 1)
                                    field.onChange(newItems)
                                  }}
                                >
                                  {item} ×
                                </Button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='chronicDiseases'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bệnh mãn tính</FormLabel>
                        <FormControl>
                          <div className='space-y-2'>
                            <Input
                              placeholder='Nhập bệnh và nhấn Enter để thêm'
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const target = e.target as HTMLInputElement
                                  if (target.value.trim()) {
                                    field.onChange([...field.value, target.value.trim()])
                                    target.value = ''
                                  }
                                }
                              }}
                            />
                            <div className='flex flex-wrap gap-2'>
                              {field.value?.map((item, index) => (
                                <Button
                                  key={index}
                                  variant='secondary'
                                  size='sm'
                                  onClick={() => {
                                    const newItems = [...field.value]
                                    newItems.splice(index, 1)
                                    field.onChange(newItems)
                                  }}
                                >
                                  {item} ×
                                </Button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='familyHistory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiền sử gia đình</FormLabel>
                      <FormControl>
                        <Textarea {...field} className='min-h-[80px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='surgeryHistory'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiền sử phẫu thuật</FormLabel>
                      <FormControl>
                        <Textarea {...field} className='min-h-[80px]' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                  <BriefcaseMedical className='w-5 h-5 text-primary' />
                  Thuốc đang sử dụng
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <FormField
                  control={form.control}
                  name='currentMedications'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='space-y-2'>
                          <Input
                            placeholder='Nhập tên thuốc và nhấn Enter để thêm'
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const target = e.target as HTMLInputElement
                                if (target.value.trim()) {
                                  field.onChange([...field.value, target.value.trim()])
                                  target.value = ''
                                }
                              }
                            }}
                          />
                          <div className='flex flex-wrap gap-2'>
                            {field.value?.map((item, index) => (
                              <Button
                                key={index}
                                variant='secondary'
                                size='sm'
                                onClick={() => {
                                  const newItems = [...field.value]
                                  newItems.splice(index, 1)
                                  field.onChange(newItems)
                                }}
                              >
                                {item} ×
                              </Button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Lifestyle Section */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                  <Activity className='w-5 h-5 text-primary' />
                  Lối sống
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='lifestyle.smoking'
                    render={({ field }) => (
                      <FormItem className='flex gap-2 items-center space-y-0'>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className='font-normal cursor-pointer'>Hút thuốc</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='lifestyle.alcohol'
                    render={({ field }) => (
                      <FormItem className='flex gap-2 items-center space-y-0'>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className='font-normal cursor-pointer'>Uống rượu</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='lifestyle.exercise'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tập thể dục</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='Mô tả chế độ tập luyện...' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lifestyle.diet'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chế độ ăn</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='Mô tả chế độ ăn uống...' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                  <Phone className='w-5 h-5 text-primary' />
                  Liên hệ khẩn cấp
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='emergencyContact.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên người liên hệ</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='emergencyContact.phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='emergencyContact.relationship'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mối quan hệ</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn mối quan hệ' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELATIONSHIPS.map((rel) => (
                              <SelectItem key={rel} value={rel}>
                                {rel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                  <Shield className='w-5 h-5 text-primary' />
                  Thông tin bảo hiểm
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='insurance.number'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số bảo hiểm</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='insurance.provider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhà cung cấp</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn nhà cung cấp' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INSURANCE_PROVIDERS.map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {provider}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='insurance.expired'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày hết hạn</FormLabel>
                        <FormControl>
                          <Input
                            type='date'
                            {...field}
                            value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className='flex gap-4 justify-center'>
              <Button effect='ringHover' type='submit' className='min-w-[150px]' disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Đang xử lý...' : patientRecord?.data ? 'Cập nhật' : 'Tạo hồ sơ'}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className='space-y-6'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                <UserCircle className='w-5 h-5 text-primary' />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {renderField('Nghề nghiệp', patientRecord?.data?.occupation || '—')}
                {renderField('Nhóm máu', patientRecord?.data?.bloodType || '—')}
                {renderField('Chiều cao', `${patientRecord?.data?.height} cm`)}
                {renderField('Cân nặng', `${patientRecord?.data?.weight} kg`)}
                {renderField('Đang mang thai', patientRecord?.data?.isPregnant || false)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                <HeartPulse className='w-5 h-5 text-primary' />
                Thông tin sức khỏe
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>{renderArrayField('Dị ứng', patientRecord?.data?.allergies)}</div>
                  <div>{renderArrayField('Bệnh mãn tính', patientRecord?.data?.chronicDiseases)}</div>
                </div>
                <Separator />
                {renderField('Tiền sử gia đình', patientRecord?.data?.familyHistory || '—')}
                <Separator />
                {renderField('Tiền sử phẫu thuật', patientRecord?.data?.surgeryHistory || '—')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                <BriefcaseMedical className='w-5 h-5 text-primary' />
                Thuốc đang sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              {renderArrayField('Danh sách thuốc', patientRecord?.data?.currentMedications)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                <Activity className='w-5 h-5 text-primary' />
                Lối sống
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {renderField('Hút thuốc', patientRecord?.data?.lifestyle?.smoking || false)}
                {renderField('Uống rượu', patientRecord?.data?.lifestyle?.alcohol || false)}
              </div>
              <Separator className='my-4' />
              {renderField('Tập thể dục', patientRecord?.data?.lifestyle?.exercise || '—')}
              <Separator className='my-4' />
              {renderField('Chế độ ăn', patientRecord?.data?.lifestyle?.diet || '—')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                <Phone className='w-5 h-5 text-primary' />
                Liên hệ khẩn cấp
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {renderField('Tên người liên hệ', patientRecord?.data?.emergencyContact?.name || '—')}
                {renderField('Số điện thoại', patientRecord?.data?.emergencyContact?.phone || '—')}
                {renderField('Mối quan hệ', patientRecord?.data?.emergencyContact?.relationship || '—')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex gap-2 items-center text-lg font-semibold'>
                <Shield className='w-5 h-5 text-primary' />
                Thông tin bảo hiểm
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {renderField('Số bảo hiểm', patientRecord?.data?.insurance?.number || '—')}
                {renderField('Nhà cung cấp', patientRecord?.data?.insurance?.provider || '—')}
                {renderField(
                  'Ngày hết hạn',
                  format(new Date(patientRecord?.data?.insurance?.expired || new Date()), 'dd/MM/yyyy')
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
