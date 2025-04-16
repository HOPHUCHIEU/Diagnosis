import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUpdateDoctorProfileMutation } from '@/redux/services/doctorApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { format } from 'date-fns'
import { User } from '@/types/user.type'
import { doctorProfileSchema, type DoctorProfileSchema } from '@/utils/rules'
import { bufferToHex } from '@/utils/utils'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, X, Pencil } from 'lucide-react'
import { DoctorProfile, CreateDoctorProfileInput } from '@/types/doctor.type'
import { LANGUAGES, SPECIALTIES, DEGREES } from '@/constants/schedules.doctor'
import { useState } from 'react'

interface Props {
  user: User | null
  doctorProfile: DoctorProfile | undefined
  loadingDoctorProfile: boolean
}

export default function DoctorInfo({ user, doctorProfile, loadingDoctorProfile }: Props) {
  const [updateProfile, { isLoading }] = useUpdateDoctorProfileMutation()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<DoctorProfileSchema>({
    resolver: yupResolver(doctorProfileSchema),
    values: {
      licenseNumber: doctorProfile?.licenseNumber || '',
      specialties: doctorProfile?.specialties || [],
      yearsOfExperience: doctorProfile?.yearsOfExperience || 0,
      education: doctorProfile?.education || [],
      certificates: doctorProfile?.certificates || [],
      languages: doctorProfile?.languages || ['Tiếng Việt'],
      biography: doctorProfile?.biography || '',
      achievements: doctorProfile?.achievements || [],
      consultationFee: doctorProfile?.consultationFee || 0,
      isAvailable: doctorProfile?.isAvailable ?? true,
      profileImage: doctorProfile?.profileImage || null
    }
  })

  const onSubmit = async (data: DoctorProfileSchema) => {
    if (!user?._id) return

    try {
      const formData = { ...data, doctorId: bufferToHex(user._id) }
      await updateProfile({
        data: formData as CreateDoctorProfileInput
      }).unwrap()

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Cập nhật hồ sơ bác sĩ thành công'
        }
      })
      setIsEditing(false)
    } catch (error: any) {
      console.log('error', error)
    }
  }
  if (loadingDoctorProfile) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
      </div>
    )
  }
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <p className='font-semibold leading-none tracking-tight'>Thông tin bác sĩ</p>
        <Button variant='outline' size='sm' onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? (
            'Hủy'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' />
              Chỉnh sửa
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='licenseNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số giấy phép</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='yearsOfExperience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số năm kinh nghiệm</FormLabel>
                  <FormControl>
                    <Input
                      max={100}
                      maxLength={2}
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='consultationFee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phí tư vấn (VNĐ)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='specialties'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chuyên khoa</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange([...field.value, value])}
                    value={field.value?.[0]}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn chuyên khoa' />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.filter((specialty) => !field.value.includes(specialty)).map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {field.value?.map((specialty, index) => (
                    <Button
                      key={specialty}
                      variant='secondary'
                      size='sm'
                      onClick={() => {
                        const newSpecialties = [...field.value]
                        newSpecialties.splice(index, 1)
                        field.onChange(newSpecialties)
                      }}
                      disabled={!isEditing}
                    >
                      {specialty} ×
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='biography'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiểu sử</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className='min-h-[100px]'
                    placeholder='Nhập tiểu sử bác sĩ...'
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className='my-6' />

          {/* Education Section */}
          <div className='space-y-8'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Học vấn</h3>
              {isEditing && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const currentEducation = form.getValues('education')
                    form.setValue('education', [
                      ...currentEducation,
                      { degree: '', university: '', graduationYear: new Date().getFullYear(), specialization: '' }
                    ])
                  }}
                >
                  <PlusCircle className='w-4 h-4 mr-2' />
                  Thêm học vấn
                </Button>
              )}
            </div>

            {form.watch('education').map((_, index) => (
              <Card key={index}>
                <CardContent className='pt-2 pb-8'>
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        const education = form.getValues('education')
                        education.splice(index, 1)
                        form.setValue('education', education)
                      }}
                      disabled={!isEditing}
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name={`education.${index}.degree`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bằng cấp</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.university`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trường</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.graduationYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Năm tốt nghiệp</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              onChange={(e) => field.onChange(+e.target.value)}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.specialization`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chuyên ngành</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className='my-6' />

          {/* Certificates Section */}
          <div className='space-y-8'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Chứng chỉ</h3>
              {isEditing && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const currentCertificates = form.getValues('certificates')
                    form.setValue('certificates', [
                      ...currentCertificates,
                      {
                        name: '',
                        issuedBy: '',
                        issueDate: new Date().toISOString(),
                        expiryDate: new Date().toISOString()
                      }
                    ])
                  }}
                >
                  <PlusCircle className='w-4 h-4 mr-2' />
                  Thêm chứng chỉ
                </Button>
              )}
            </div>

            {form.watch('certificates').map((_, index) => (
              <Card key={index}>
                <CardContent className='pt-2 pb-8'>
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        const certificates = form.getValues('certificates')
                        certificates.splice(index, 1)
                        form.setValue('certificates', certificates)
                      }}
                      disabled={!isEditing}
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên chứng chỉ</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Ví dụ: Chứng chỉ chuyên khoa Tim mạch'
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.issuedBy`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nơi cấp</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Ví dụ: Bộ Y tế' disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.issueDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày cấp</FormLabel>
                          <FormControl>
                            <Input
                              type='date'
                              {...field}
                              value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.expiryDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày hết hạn</FormLabel>
                          <FormControl>
                            <Input
                              type='date'
                              {...field}
                              value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className='my-6' />

          {/* Languages Section */}
          <FormField
            control={form.control}
            name='languages'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngôn ngữ</FormLabel>
                <FormControl>
                  <Select onValueChange={(value) => field.onChange([...field.value, value])} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn ngôn ngữ' />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.filter((lang) => !field.value.includes(lang)).map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {field.value?.map((lang, index) => (
                    <Button
                      key={lang}
                      variant='secondary'
                      size='sm'
                      onClick={() => {
                        const newLanguages = [...field.value]
                        newLanguages.splice(index, 1)
                        field.onChange(newLanguages)
                      }}
                      disabled={!isEditing}
                    >
                      {lang} ×
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className='my-6' />

          {/* Achievements Section */}
          <FormField
            control={form.control}
            name='achievements'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thành tựu</FormLabel>
                <FormControl>
                  <div className='space-y-2'>
                    <Input
                      placeholder='Nhập thành tựu và nhấn Enter để thêm'
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
                      disabled={!isEditing}
                    />
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {field.value?.map((achievement, index) => (
                        <Button
                          key={index}
                          variant='secondary'
                          size='sm'
                          onClick={() => {
                            const newAchievements = [...field.value]
                            newAchievements.splice(index, 1)
                            field.onChange(newAchievements)
                          }}
                          disabled={!isEditing}
                        >
                          {achievement} ×
                        </Button>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEditing && (
            <div className='flex justify-center gap-4'>
              <Button effect='ringHover' className='min-w-[150px]' type='submit' disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Cập nhật'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
