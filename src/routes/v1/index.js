const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const extraRoute = require('./extra.route');
const paymentRoute = require('./payment.route');
const adminRoute = require('./admin.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/test',
    route: extraRoute,
  },
  {
    path: '/stripe',
    route: paymentRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
