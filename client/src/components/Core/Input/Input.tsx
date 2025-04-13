import { InputHTMLAttributes } from 'react'
import type { RegisterOptions, UseFormRegister } from 'react-hook-form'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
  label?: any
  classNameInput?: string
  classNameError?: string
  register?: UseFormRegister<any>
  rules?: RegisterOptions
  endIcon?: React.ReactNode
}

export default function Input({
  errorMessage,
  className,
  name,
  label,
  register,
  rules,
  classNameInput,
  classNameError = 'mt-1 text-sm text-red-600 min-h-5',
  endIcon,
  ...rest
}: Props) {
  const registerResult = register && name ? register(name, rules) : {}
  return (
    <div className={className}>
      {label && <label className='--font-semibold'>{label}</label>}
      <div className='relative flex items-center'>
        <input
          className={
            'w-full p-3 border border-gray-300 rounded-sm outline-none focus:border-gray-500 duration-300 ' +
            classNameInput
          }
          {...registerResult}
          {...rest}
        />
        {endIcon && <div className='absolute inset-y-0 right-0 flex items-center pr-3 text-base'>{endIcon}</div>}
      </div>
      <div className={classNameError}>{errorMessage}</div>
    </div>
  )
}
