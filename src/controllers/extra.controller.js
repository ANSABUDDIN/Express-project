const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const data = require('./data.json');

const dump = catchAsync(async (req, res) => {
  console.log('came here');
  res.status(httpStatus.OK).send(data);
});

module.exports = {
  dump,
};
