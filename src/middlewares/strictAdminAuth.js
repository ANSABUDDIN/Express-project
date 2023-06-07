const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user || user.acc_type !== 'admin') {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'no_login'));
  }
  req.user = user;
  console.log(user, !user.acc_type === 'admin');

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
