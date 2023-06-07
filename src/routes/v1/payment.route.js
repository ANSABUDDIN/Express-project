const express = require('express');
const paymentController = require('../../controllers/payment.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');

const router = express.Router();

router.post('/intent', paymentController.paymentTypeOne);

router.post('/intent/new', paymentController.paymentTypeTwo);

router.post('/session-initiate', paymentController.initiatePayment);

router.post('/session-complete', paymentController.completePayment);

router.post('/link', auth(), validate(userValidation.paymentLink), paymentController.createPaymentLink);

router.get('/status/:id', auth(), paymentController.paymentStatus);

router.post('/update', auth(), validate(userValidation.savePaymentDetails), paymentController.savePaymentDetails);

module.exports = router;
