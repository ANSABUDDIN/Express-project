const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

router
  .route('/car/new')
  .post(auth(), validate(userValidation.createCar), userController.createCar)
  .patch(auth(), validate(userValidation.editCar), userController.editCar)
  .delete(auth(), validate(userValidation.deleteCar), userController.deleteCar);

router.route('/cars').get(userController.getCars);

router.route('/cars/search').get(validate(userValidation.getCars), userController.searchCars);

router.route('/cars/me').get(auth(), userController.getMyCars);
router.route('/cars/me/all').get(auth(), userController.getAllMyCars);

router.route('/cars/me/search').get(auth(), validate(userValidation.searchMeCars), userController.searchMeCars);

router.route('/car/new/book').post(validate(userValidation.bookCarTicket), userController.createTicket);

router.route('/car/new/book/cancel').post(auth(), validate(userValidation.cancelCarTicket), userController.cancelCarTicket);

// Cancel booking for user
router.route('/cancelbooking/:id').get(userController.cancelCarTicketEndUser);

router.route('/car/earning').get(auth(), validate(userValidation.getCarEarning), userController.getCarEarning);

router
  .route('/car/new/book/direct')
  .post(auth(), validate(userValidation.createContract), userController.createContract)
  .patch(auth(), validate(userValidation.editContract), userController.editContract);

router.route('/car/new/book/direct/checkin').post(auth(), validate(userValidation.endContract), userController.endContract);

// cash receipt
router.route('/car/cash/receipt').post(auth(), validate(userValidation.cashReceipt), userController.cashReceipt);

// add expense
router
  .route('/accounts/expense')
  .get(auth(), userController.getExpense)
  .post(auth(), validate(userValidation.addExpense), userController.addExpense);

// add withdrawl
router
  .route('/accounts/withdraw')
  .get(auth(), userController.getWithdrawl)
  .post(auth(), validate(userValidation.addWithdrawl), userController.addWithdrawl);

router.route('/contract/:id/get').get(auth(), userController.getContract);

router.route('/contract/me').get(auth(), userController.listContracts);

router.route('/contract/payments').get(auth(), userController.allPayments);

router.route('/contract/:id/payments').get(auth(), userController.contractPayments);

router.route('/contract/:id/cancel').get(auth(), userController.cancelContract);

router.route('/sign').post(auth(), validate(userValidation.signFile), userController.signFile);

// router.route('/').post(auth(), validate(userValidation.signFile), userController.signFile);

router.route('/ticket/list').get(auth(), userController.getTickets);

router.route('/me').get(auth(), userController.getSelf);

// CRUD member
router
  .route('/member')
  .get(auth(), userController.getMembers)
  .post(auth(), validate(userValidation.createMember), userController.createMember)
  .patch(auth(), validate(userValidation.editMember), userController.editMember)
  .delete(auth(), validate(userValidation.deleteMember), userController.deleteMember);

// CRD blacklist

router
  .route('/blacklist')
  .get(auth(), userController.getBlackListed)
  .post(auth(), validate(userValidation.createBlacklist), userController.createBlacklist)
  .delete(auth(), validate(userValidation.removeBlacklist), userController.removeBlacklist);

// Contact us
router.post('/contactus', validate(userValidation.contactUs), userController.contactUs);

router.get('/capital', auth(), validate(userValidation.getCapital), userController.getCapital);

router.post('/contract/import', auth(), validate(userValidation.importContract), userController.importContract);

router.post('/add-subscription', userController.addSubscription)

router.get('/get-subscription', auth(), userController.getSubscription)

router.get('/does-email-exists/:email', userController.doesEmailExists)

module.exports = router;
