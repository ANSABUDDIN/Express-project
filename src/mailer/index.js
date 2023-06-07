const { env: appEnv, email } = require('../config/config');

const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey(email.apiKey);

// ToDo: enter from email here
async function sendEmail({ recipient, subject, data }) {
  console.log("email")
  console.log(email)
  const mailOptions = {
    to: recipient,
    from: email.emailFrom,
    subject: subject,
    html: data,
  };

  if (appEnv !== 'production') {
    mailOptions.to = 'ritikthakur800@gmail.com';
  }

  try {
    await sendGridMail.send(mailOptions);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email');
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}

module.exports = sendEmail;
