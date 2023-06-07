const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    AWS_REGION: Joi.string().description('AWS region code'),
    AWSAccessKeyId: Joi.string().description('AWS Access key id'),
    AWSSecretKey: Joi.string().description('AWS Access key secret'),
    AWSBucket: Joi.string().description('AWS Bucket Name'),
    STRIPE_SECRET_KEY: Joi.string().description('Stripe test key'),
    STRIPE_ENDPOINT_SECRET: Joi.string().description('Stripe endpoint secret key'),
    SENDGRID_API_KEY: Joi.string().description('Sendgrid api key'),
    EMAIL_FROM: Joi.string().description('Email id which is sending emails'),
    ADMIN_EMAIL: Joi.string().description('Admin email to send emails'),
    APP_URL: Joi.string().description('Web url of the api'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  app: {
    url: envVars.APP_URL,
  },
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKey: envVars.AWSAccessKeyId,
    accessSecret: envVars.AWSSecretKey,
    bucket: envVars.AWSBucket,
  },
  stripe: {
    test_secret: envVars.STRIPE_SECRET_KEY,
    endpoint_secret: envVars.STRIPE_ENDPOINT_SECRET,
  },
  email: {
    apiKey: envVars.SENDGRID_API_KEY,
    emailFrom: envVars.EMAIL_FROM,
    adminEmail: envVars.ADMIN_EMAIL,
  },
};
