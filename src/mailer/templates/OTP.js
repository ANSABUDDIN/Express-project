export default function otpTemplate({ name, otp }) {
  const subject = "Confirm your registration";
  const data = `
  <head>
  <title>Let's finish verifying your account</title>
  <link
      href="https://fonts.googleapis.com/css?family=Courgette|Roboto&display=swap"
      rel="stylesheet"
  />
</head>
<body>

<div
  style="text-align: center;max-width: 595px;justify-content: center;margin:0px auto;"
>
  <br />
  <p style="margin-top:30px;margin-bottom: 22px;font-size:16px;line-height: 25px;letter-spacing: 0.1px;">Welcome ${name},</p>
 
  <p style="margin-top:10px;margin-bottom: 16px;font-weight: bold;font-size: 16px;line-height: 28px;">${otp} is your OTP.</p>
  <p style="margin:10px 35px 10px 35px;text-align:center;font-size: 16px;line-height: 25px;font-weight: 500;">
      Verify your email and start using Lmaooo
  </p>
  
  <p style="margin:10px 35px 10px 35px;text-align:center;color: #000609;font-size: 1.0625em">If you have any additional queries, you can connect with us at <span style="color:#005083;font-size: 1.0625em">lmaoooDOTcom@gmail.com</span></p>
  
  <div style="border: 1px solid #BFBFBF;margin: 10px 35px 10px 35px;"></div>
  <p style="text-align:justify;font-size: 0.8125em;line-height: 19px;letter-spacing: 0.1px;color: #4B5E71;margin:0px 53px;">You are receiving this email because you recently signed up for a new account at Lmaooo. This is an automated email.</p>
  <div style="border: 1px solid #BFBFBF;margin: 10px 35px 10px 35px;"></div>

  <p style="text-align: left;font-size: 1.0625em;line-height: 25px;letter-spacing: 0.1px;margin: 29px 53px 0px 53px;">Thank you,</p>
  <p style="text-align: left;font-size: 1.0625em;line-height: 25px;letter-spacing: 0.1px;margin: 0px 53px 53px 53px;">Team Lmaooo</p>
  </div>
</body>
</html>
    `;
  return { data, subject };
}
