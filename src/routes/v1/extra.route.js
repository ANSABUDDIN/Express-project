const express = require('express');
const extraController = require('../../controllers/extra.controller');

const router = express.Router();

router.get('/', extraController.dump);

module.exports = router;
