function base({ sub, name, email, message }) {
  const subject = `Subject: ${sub}`;
  const data = `
  <head>
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
  <div style="border: 1px solid #BFBFBF;margin: 10px 35px 10px 35px;"></div>

  <p style="margin-top:10px;margin-bottom: 16px;font-size: 16px;line-height: 28px;">Name: ${name}</p>
  <p style="margin:10px 35px 10px 35px;text-align:center;font-size: 16px;line-height: 25px;font-weight: 500;">
      Email: ${email}
  </p>
  <p style="margin:10px 35px 10px 35px;text-align:center;font-size: 16px;line-height: 25px;font-weight: 500;">
    Message: ${message}
  </p>
  <div style="border: 1px solid #BFBFBF;margin: 10px 35px 10px 35px;"></div>
  </div>
</body>
</html>

    `;
  return { data, subject };
}

module.exports = base;
