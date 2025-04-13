import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Styled = styled.div`
  #title {
    font-family: 'Bungee', cursive;
  }
`
function Page_NotFound() {
  const navigate = useNavigate()
  return (
    <Styled>
      <div className='flex flex-col items-center justify-center w-full my-32 bg-white h-fit'>
        <p id='title' className='font-extrabold tracking-wider text-[#1f1f1f] text-[13rem]'>
          404
        </p>
        <div className='bg-blue_app text-white px-2 py-1 text-lg font-bold rounded -rotate-6 absolute mt-[-200px]'>
          Page not found
        </div>
        <div className='mt-5 text-center'>
          <p className='flex items-end justify-center text-2xl font-semibold text-[#1f1f1f] md:text-3xl'>
            <span className='text-5xl'>🚧</span> Xin lỗi, chúng tôi không thể tìm thấy trang này.
          </p>
          <p className='mt-4 mb-8 text-lg font-semibold text-[#1f1f1f]  '>
            Nhưng đừng lo lắng, bạn có thể tìm thấy rất nhiều thứ khác trên trang chủ của chúng tôi.
          </p>
        </div>
        <button className='mt-5'>
          <div className='relative inline-block text-sm font-medium hover:text-gray-700 group active:text-gray-700 focus:outline-none focus:ring'>
            <span className='absolute inset-0 transition-transform translate-x-1 translate-y-1 rounded-lg bg-blue_app group-hover:translate-y-0 group-hover:translate-x-0'></span>
            <span
              onClick={() => navigate('/')}
              className='relative block px-8 py-2 border border-current rounded-lg bg-blue_app hover:opacity-95'
            >
              <p className='flex items-center justify-center h-8 text-lg font-semibold text-white'>Trang chủ</p>
            </span>
          </div>
        </button>
      </div>
    </Styled>
  )
}

export default Page_NotFound
