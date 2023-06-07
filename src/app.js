const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const path = require('path');

const { paymentService, userService } = require('./services/index');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

const stripe = require('stripe')(config.stripe.test_secret);

app.use(
  express.json({
    // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// Stripe routes
app.post('/webhook', async (request, response) => {
  let event = request.body;
  // console.log('Event without construct', event);

  // if (config.stripe.endpoint_secret) {
  //   const signature = request.headers['stripe-signature'];
  //   try {
  //     console.log(request.rawBody, signature, config.stripe.endpoint_secret);
  //     event = stripe.webhooks.constructEvent(request.rawBody, signature, config.stripe.endpoint_secret);
  //   } catch (err) {
  //     console.log(`⚠️  Webhook signature verification failed.`, err.message);
  //     return response.sendStatus(400);
  //   }
  // }

  const signature = request.headers['stripe-signature'];

  switch (event.type) {
    case 'payment_intent.succeeded':
      try {
        event = stripe.webhooks.constructEvent(request.rawBody, signature, config.stripe.endpoint_secret);
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`, paymentIntent);
        paymentService.handlePaymentSuccess(paymentIntent);
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
      break;
    case 'checkout.session.completed':
      const stripeEndpointSecret = await userService.getStripeEndpointSecret(event.data.object.payment_link);
      try {
        event = stripe.webhooks.constructEvent(request.rawBody, signature, stripeEndpointSecret);
        const checkoutSessionData = event.data.object;
        console.log(`Checkout session was successful!`, checkoutSessionData);
        paymentService.handlePaymentSuccess({
          id: checkoutSessionData.payment_link,
          payment_intent: checkoutSessionData.payment_intent,
        });
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`, event);
  }

  response.send();
});

// parse json request body
// app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
// app.use(passport.initialize());
// passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/api/v1/auth', authLimiter);
// }

// v1 api routes
// app.use('/api/v1', routes);
app.get('/', (req, res) => {
  res
    .status(200)
    .send('Automaar Car-rental System is Live now')
    .end();
});

// app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// app.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'), function (err) {
//     if (err) {
//       console.log(err);
//       res.status(500).send(err);
//     }
//   });
// });

// send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

// convert error to ApiError, if needed
// app.use(errorConverter);

// handle error
// app.use(errorHandler);

module.exports = app;
