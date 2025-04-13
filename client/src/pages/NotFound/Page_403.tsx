function Page_403() {
  const handleBack = () => {
    window.history.back()
  }
  return (
    <section className='bg-white '>
      <div className='container flex items-center min-h-[60vh] px-6 py-12 mx-auto'>
        <div>
          <p className='text-base font-medium text-primary '>403 Forbidden</p>
          <h1 className='mt-3 text-2xl font-semibold text-gray-800 md:text-4xl'>Forbiden </h1>
          <p className='mt-4 text-gray-500 '>Sorry, you do not have access to this page or resource.</p>
          <div className='flex items-center mt-6 gap-x-3'>
            <button
              onClick={() => handleBack()}
              className='flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100 '
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='w-5 h-5 rtl:rotate-180'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18' />
              </svg>
              <span>Go back</span>
            </button>
            <a
              href='/'
              className='w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 rounded-lg bg-primary/80 shrink-0 sm:w-auto hover:bg-primary '
            >
              Take me home
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Page_403
