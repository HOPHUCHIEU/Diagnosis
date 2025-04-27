import { Bot, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import ChatbotDialog from './ChatbotDialog'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const popupAnimationClass = isOpen
    ? 'opacity-100 translate-y-0 scale-100'
    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`h-12 w-12 min-h-12 min-w-12 cursor-pointer fixed bottom-[24px] right-[24px] z-[999] flex items-center justify-center rounded-full bg-primary text-[3rem] shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <span className='absolute w-3 h-3 rounded-full bg-red-500 top-0 right-0 flex items-center justify-center text-[10px] font-bold animate-pulse'></span>
        <div className='zalozoomzoom bg-primary'></div>
        <div className='zalozoomzoom bg-primary'></div>
        <div className='zalozoomzoom bg-primary'></div>
        <div className='zalozoomzoom bg-primary'></div>
        <Bot className='w-7 h-7 text-white animate-pulse' />
      </div>

      <div
        ref={popupRef}
        className={`fixed bottom-[60px] right-[14px] z-[999] w-[93%] sm:w-[400px] md:w-[450px] h-[450px] sm:h-[85vh] rounded-lg shadow-xl bg-white transition-all duration-300 ease-in-out transform origin-bottom-right ${popupAnimationClass}`}
        style={{
          boxShadow: isOpen ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none'
        }}
      >
        <div className='flex overflow-hidden relative flex-col w-full h-full rounded-lg'>
          <button
            onClick={() => setIsOpen(false)}
            className='flex absolute right-3 top-4 z-10 justify-center items-center w-6 h-6 bg-gray-100 rounded-full transition-colors duration-200 hover:bg-gray-200'
          >
            <X className='w-4 h-4' />
          </button>

          <ChatbotDialog onClose={() => setIsOpen(false)} />
        </div>
      </div>
    </>
  )
}
