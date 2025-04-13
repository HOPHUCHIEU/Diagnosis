import { ToastContentProps } from 'react-toastify'

type CustomNotificationProps = ToastContentProps<{
  title: string
  content: string
}>

export function CustomNotification({ closeToast, data, toastProps }: CustomNotificationProps) {
  return (
    <div className='flex flex-col w-full'>
      <p className={'text-sm font-semibold text-zinc-800'}>{data.title}</p>
      <div className='flex items-center justify-between'>
        <p className='text-sm'>{data.content}</p>
      </div>
    </div>
  )
}
