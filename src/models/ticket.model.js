const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const ticketSchema = mongoose.Schema(
  {
    owner_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    token_id: {
      type: String,
    },
    car_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Car',
      required: true,
    },
    isPaymentCompleted: {
      type: Boolean,
      default: false,
    },
    transaction_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Transaction',
    },
    contract_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Contract',
    },
    pick_up: {
      type: Date,
      required: true,
    },
    drop_off: {
      type: Date,
      required: true,
    },
    driver_info: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      license_country: { type: String, required: true },
      address: {
        city: String,
        country: String,
        line1: String,
        line2: String,
        postal_code: String,
        state: String,
      },
      contact_details: {
        country_code: { type: String, required: true },
        phone_number: { type: Number, required: true },
        email: { type: String, required: true },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ticketSchema.plugin(toJSON);

/**
 * @typedef Ticket
 */
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
