import { StarIcon, TrendingUpIcon, RotateCcwIcon } from 'lucide-react'

// Hiển thị số sao dưới dạng component
export const StarRating = ({ count }: { count: number }) => {
  return (
    <div className='flex'>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <StarIcon
            key={index}
            className={`h-4 w-4 ${index < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
    </div>
  )
}

// Kiểm tra ca làm việc
export const ShiftCheck = ({ schedule, shift }: { schedule: any; shift: string }) => {
  if (!schedule || !schedule.schedules) return false
  return schedule.schedules[shift] === true
}

// Hiển thị trend với icon
export const TrendIndicator = ({ value, className }: { value: number; className?: string }) => (
  <span
    className={`ml-2 text-xs ${value > 0 ? 'text-green-500' : 'text-red-500'} flex items-center ${className || ''}`}
  >
    {value > 0 ? <TrendingUpIcon className='w-3 h-3 mr-0.5' /> : <RotateCcwIcon className='w-3 h-3 mr-0.5' />}
    {Math.abs(Math.round(value))}%
  </span>
)
