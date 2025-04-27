export const notificationTemplate = (
  title: string,
  message: string,
): string => {
  const content = `
  <div style="text-align: left; padding: 10px;">
    <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; text-align: center;">
      ${title}
    </h2>
    
    <div style="
      max-width: 600px;
      margin: 0 auto;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    ">
      <div style="
        color: #333;
        font-size: 16px;
        line-height: 1.6;
      ">
        ${message}
      </div>
    </div>

    <div style="
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 14px;
      text-align: center;
    ">
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
  `;

  return content;
};
