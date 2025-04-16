import { useTranslation } from 'react-i18next'
import './Footer.css'

const Footer = () => {
  const { i18n, t } = useTranslation('landing')
  return (
    <footer className='footer'>
      <div className='footer__content'>
        <div className='footer__section'>
          <h4>Diagnosis AI</h4>
          <p>{t('footer.DN')}</p>
          <p>{t('footer.Hotline')}</p>
          <p>{t('footer.AI')}</p>
          <p>Sương - Hiếu - Thành - Báu - Hà</p>
        </div>
        <div className='footer__section'>
          <h4>{t('footer.about')}</h4>
          <ul>
            <li>
              <a href='/gioi-thieu'>Giới thiệu về CAPSTONE 2</a>
            </li>
            <li>
              <a href='#'>Thành viên nhóm</a>
            </li>
            <li>
              <a href='#'>Thông tin dự án</a>
            </li>
            <li>
              <a href='tel:+84356241423'>Liên hệ</a>
            </li>
          </ul>
        </div>
        <div className='footer__section'>
          <h4>Dịch vụ</h4>
          <ul>
            <li>
              <a href='#'>Tin tức y tế</a>
              {/* sửa link liên kết tới trang */}
            </li>
            <li>
              <a href='#'>Tư Vấn Trực Tuyến</a>
            </li>
            <li>
              <a href='#'>Đặt khám Chuyên Khoa</a>
            </li>
            <li>
              <a href='#'>Hồ Sơ Bệnh Án</a>
            </li>
            <li>
              <a href='#'>Dịch vụ Phòng Khám</a>
            </li>
          </ul>
        </div>
        <div className='footer__section'>
          <h4>Hỗ trợ</h4>
          <ul>
            <li>
              <a href='#'>Điều Khoản Sử Dụng</a>
            </li>
            {/* chuyển link blog về trang blog */}
            <li>
              <a href='#'>Chính Sách Bảo Mật</a>
            </li>
            <li>
              <a href='#'>Chính sách giải quyết khiếu nại</a>
            </li>
            <li>
              <a href='#'>Hỗ trợ khách hàng</a>
            </li>
            <li>
              <a href='#'>Tư vấn khách hàng</a>
            </li>
          </ul>
        </div>
      </div>
      <div className='footer__bottom'>
        <p>
          Các thông tin trên Capstone2 chỉ dành cho mục đích tham khảo, tra cứu và không thay thế cho việc chẩn đoán
          hoặc điều trị y khoa.
        </p>
        <p>Cần tuyệt đối tuân theo hướng dẫn của Bác sĩ và Nhân viên y tế.</p>
        <p>Copyright © 2018 - 2025 Công ty TNHH Capstone2 Việt Nam.</p>
      </div>
    </footer>
  )
}

export default Footer
