const Joi = require('joi');
const { password } = require('./custom.validation');

const getClients = {
  query: Joi.object().keys({
    start: Joi.date(),
    end: Joi.date(),
  }),
};

const addPolice = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    phone_number: Joi.string().required(),
    pd_address: Joi.string().required(),
    acc_type: Joi.string().valid('police').required(),
    nationality: Joi.string().required()
  }),
};

const editPolice = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string(),
    phone_number: Joi.string().required(),
    pd_address: Joi.string().required(),
    nationality: Joi.string().required()
  }),
};

const editCorporation = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    email: Joi.string().email(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    phone_number: Joi.string(),
    address: {
      line1: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      zip: Joi.string(),
    },
    corporation_name: Joi.string(),
    commercial_number: Joi.string(),
    expiry_date: Joi.string(),
  }),
};

module.exports = {
  getClients,
  addPolice,
  editPolice,
  editCorporation,
};
