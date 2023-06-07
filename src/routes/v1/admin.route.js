const express = require('express');
const validate = require('../../middlewares/validate');
const adminValidation = require('../../validations/admin.validation');
const adminController = require('../../controllers/admin.controller');
const adminAuth = require('../../middlewares/adminAuth');
const strictAdminAuth = require('../../middlewares/strictAdminAuth');

const router = express.Router();

router.get('/dashboard', adminAuth(), adminController.dashboardCount);

router
  .route('/corporations')
  .get(strictAdminAuth(), adminController.getCorporations)
  .post(strictAdminAuth(), validate(adminValidation.editCorporation), adminController.editCorporation)
  .delete(strictAdminAuth(), adminController.deleteCorporation);

router
  .get('/departments', strictAdminAuth(), adminController.getDepartments)
  .post('/departments', strictAdminAuth(), validate(adminValidation.addPolice), adminController.addPolice)
  .patch('/departments', strictAdminAuth(), validate(adminValidation.editPolice), adminController.editPolice);

router.delete('/departments/:id', strictAdminAuth(), adminController.deletePolice);

router.patch('/login/:id', strictAdminAuth(), adminController.toggleLogin);

router.get('/clients', adminAuth(), validate(adminValidation.getClients), adminController.getClients);

router.get('/tickets', adminAuth(), adminController.getTickets);

router.route('/blacklist').get(adminAuth(), adminController.getBlackListed);

// Ads
router
  .route('/ads')
  .get(adminController.getAds)
  .post(strictAdminAuth(), adminController.postAd)
  .delete(strictAdminAuth(), adminController.deleteAd);

module.exports = router;
