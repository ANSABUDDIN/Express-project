const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');

const paymentTypeOne = catchAsync(async (req, res) => {
  const newPayment = await paymentService.savePaymentIntentType1({ ...req.body });
  res.status(httpStatus.CREATED).send(newPayment);
});

const paymentTypeTwo = catchAsync(async (req, res) => {
  const newPayment = await paymentService.savePaymentIntentType2(req.body);
  res.status(httpStatus.CREATED).send(newPayment);
});

const createPaymentLink = catchAsync(async (req, res) => {
  const newPayment = await paymentService.createPaymentLink(req.body, req.user._id);
  res.status(httpStatus.CREATED).send(newPayment);
});

const initiatePayment = catchAsync(async (req, res) => {
  const car = await paymentService.initiatePayment({ ...req.body });
  res.status(httpStatus.CREATED).send(car);
});

const completePayment = catchAsync(async (req, res) => {
  const car = await paymentService.completePayment(req.rawBody, req.headers);
  res.status(httpStatus.CREATED).send(car);
});

const paymentStatus = catchAsync(async (req, res) => {
  const car = await paymentService.paymentStatus(req.params.id);
  res.status(httpStatus.CREATED).send(car);
});

const savePaymentDetails = catchAsync(async (req, res) => {
  await paymentService.savePaymentDetails(req.body, req.user._id);
  res.status(httpStatus.CREATED).json({ status: 'done' });
});

module.exports = {
  paymentTypeOne,
  paymentTypeTwo,
  initiatePayment,
  createPaymentLink,
  completePayment,
  paymentStatus,
  savePaymentDetails,
};
