export const baseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #FFFFFF;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
            background-color: #CFEBFC;
        }
        .title {
            font-size: 24px;
            color: #333;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
            background-color: #CFEBFC;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
                margin: 0;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="" alt="Company Logo" style="
            height: 50px;
            max-width: 100%;
            object-fit: contain;
        ">
        </div>
        <h1 class="title">${title}</h1>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} DiagnosisIQ. All rights reserved.</p>
            <p>This email was sent automatically. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`
