export const confirmationCodeTemplate = (title: string, email: string, code: string): string => {
  const content = `
    <div style="text-align: center;">
      <p style="color: #666; font-size: 16px; margin-bottom: 20px; text-align: center;">
        ${title}
      </p>
      
      <div style="
        max-width: 300px;
        margin: 0 auto;
        text-align: center;
      ">
        <p style="color: #666; font-size: 14px;">Mã xác thực của bạn là:</p>
        
        <div style="
          background-color: #f8f9fa;
          padding: 20px;
          margin: 20px auto;
          border-radius: 8px;
          border: 2px dashed #ddd;
          display: inline-block;
        ">
          <h1 style="
            color: #333;
            font-size: 36px;
            margin: 0;
            letter-spacing: 8px;
            font-weight: bold;
          ">${code}</h1>
        </div>
  
        <p style="
          color: #dc3545;
          font-size: 14px;
          margin-top: 20px;
        ">* Mã xác thực có hiệu lực trong 10 phút</p>
  
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này
        </p>
      </div>
    </div>
    `

  return content
}
