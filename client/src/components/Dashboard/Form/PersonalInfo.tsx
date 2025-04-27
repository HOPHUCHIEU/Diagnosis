import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useGetMeQuery, useUpdateMeMutation } from '@/redux/services/userApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { format } from 'date-fns'
import { User } from '@/types/user.type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as yup from 'yup'
import { Pencil, Copy } from 'lucide-react'
import { useState } from 'react'
import { bufferToHex } from '@/utils/utils'
import { toast as sonnerToast } from 'sonner'

interface Props {
  user: User | null
}

interface PersonalInfoInput {
  firstName: string
  lastName: string
  phone: string
  gender: 'male' | 'female'
  birth: Date | null
  address: string
}

// Create a specific schema for PersonalInfo
const personalInfoSchema = yup.object().shape({
  firstName: yup.string().required('Vui lòng nhập họ'),
  lastName: yup.string().required('Vui lòng nhập tên'),
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(84|0[2|3|5|7|8|9])+([0-9]{8,9})\b$/, 'Số điện thoại không hợp lệ'),
  gender: yup
    .string()
    .oneOf(['male', 'female'] as const)
    .required('Vui lòng chọn giới tính'),
  birth: yup.date().nullable()
  // address: yup.string()
}) as yup.ObjectSchema<PersonalInfoInput>

export default function PersonalInfo({ user }: Props) {
  const { refetch } = useGetMeQuery(null)
  const [updateProfile, { isLoading }] = useUpdateMeMutation()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<PersonalInfoInput>({
    resolver: yupResolver(personalInfoSchema),
    values: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      gender: user?.profile?.gender || 'male',
      birth: user?.profile?.birth ? new Date(user.profile.birth) : null,
      address: user?.profile?.address || ''
    }
  })

  const onSubmit = async (data: PersonalInfoInput) => {
    try {
      const userData = {
        ...data,
        birth: data.birth ? format(data.birth, 'yyyy-MM-dd') : '',
        fullName: `${data.lastName} ${data.firstName}`
      }
      await updateProfile({
        data: userData
      }).unwrap()
      refetch()
      setIsEditing(false)
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Cập nhật thông tin thành công'
        }
      })
    } catch (error: any) {
      console.log('error', error)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <p className='font-semibold leading-none tracking-tight'>Thông tin cá nhân</p>
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
          {user && user._id && (
            <FormItem>
              <FormLabel>ID người dùng</FormLabel>
              <div className='flex items-center'>
                <Input value={bufferToHex(user._id)} disabled className='font-mono text-sm' />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='ml-2'
                  onClick={() => {
                    navigator.clipboard.writeText(bufferToHex(user._id))
                    sonnerToast.success('Đã sao chép ID người dùng')
                  }}
                  title='Sao chép ID'
                >
                  <Copy className='w-4 h-4' />
                </Button>
              </div>
            </FormItem>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='birth'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày sinh</FormLabel>
                <FormControl>
                  <Input
                    type='date'
                    {...field}
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    disabled={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn giới tính' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='male'>Nam</SelectItem>
                    <SelectItem value='female'>Nữ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {isEditing && (
            <div className='flex justify-center gap-4'>
              <Button effect='ringHover' type='submit' disabled={isLoading}>
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
