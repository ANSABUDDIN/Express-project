const mailer = require('../mailer');
const VerifyEmailTemplate = require('../mailer/templates/VerifyEmail');
const ForgotPasswordTemplate = require('../mailer/templates/ForgetPassword');
const LoginActivatedTemplate = require('../mailer/templates/LoginActivated');
const RegistrationTemplate = require('../mailer/templates/Registration');
const ContactUsTemplate = require('../mailer/templates/ContactUs');

// const transport = nodemailer.createTransport(config.email.smtp);
// /* istanbul ignore next */
// if (config.env !== 'test') {
//   transport
//     .verify()
//     .then(() => logger.info('Connected to email server'))
//     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
// }

// /**
//  * Send an email
//  * @param {string} to
//  * @param {string} subject
//  * @param {string} text
//  * @returns {Promise}
//  */
// const sendEmail = async (to, subject, text) => {
//   const msg = { from: config.email.from, to, subject, text };
//   await transport.sendMail(msg);
// };

// /**
//  * Send reset password email
//  * @param {string} to
//  * @param {string} token
//  * @returns {Promise}
//  */
const sendResetPasswordEmail = async (to, token, name) => {
  const resetPasswordUrl = `https://test2.automaar.com/reset-password?token=${token}`;

  const emailData = ForgotPasswordTemplate({
    link: resetPasswordUrl,
    name,
  });
  mailer({
    recipient: to,
    subject: emailData.subject,
    data: emailData.data,
  });
};

const sendVerificationEmail = async (user, token) => {
  const verificationEmailUrl = `https://test2.automaar.com/verify-email?token=${token}`;

  const emailData = VerifyEmailTemplate({
    dealerShipName: user.corporation_name ? user.corporation_name : user.first_name + ' ' + user.last_name,
    verificationEmailUrl,
    email: user.email,
  });
  mailer({
    recipient: user.email,
    subject: emailData.subject,
    data: emailData.data,
  });
};

const sendActivationEmail = async (user) => {
  const emailData = LoginActivatedTemplate({
    name: user.corporation_name ? user.corporation_name : user.first_name + ' ' + user.last_name,
  });
  mailer({
    recipient: user.email,
    subject: emailData.subject,
    data: emailData.data,
  });
};

const sendNewUserEmail = async (to, user) => {
  const emailData = RegistrationTemplate({
    acc_type: user.acc_type.substring(0, 1).toUpperCase() + user.acc_type.substring(1),
    orgName: user.corporation_name ? user.corporation_name : user.first_name + ' ' + user.last_name,
    email: user.email,
    address:
      user.address.line1 +
      ', ' +
      user.address.city +
      ', ' +
      user.address.state +
      ', ' +
      user.address.country +
      ', ' +
      user.address.zip,
    contact: user.phone_number,
    commercialNo: user.commercial_number ? user.commercial_number : 'NA',
  });
  mailer({
    recipient: to,
    subject: emailData.subject,
    data: emailData.data,
  });
};

const sendContactusEmail = async (adminData, data) => {
  const emailData = ContactUsTemplate({
    sub: data.subject,
    name: data.name,
    email: data.email,
    message: data.message,
  });
  mailer({
    recipient: adminData.email,
    subject: emailData.subject,
    data: emailData.data,
  });
};

module.exports = {
  //   transport,
  //   sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendActivationEmail,
  sendNewUserEmail,
  sendContactusEmail,
};
