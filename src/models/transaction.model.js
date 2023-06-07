const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const generateSerialNumber = require('../utils/serial');

const transactionSchema = mongoose.Schema(
  {
    owner_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    car_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Car',
    },
    contract_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Contract',
    },
    payment_id: {
      type: String,
    },
    // Only added for links for refunds
    payment_intent: {
      type: String,
    },
    // more to be added
    payment_type: {
      type: String,
      enum: ['ticket', 'ticket_refund', 'online', 'cash', 'bank', 'expense', 'withdraw', 'withdraw_bank', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    vat: {
      type: Number,
    },
    isPaymentCompleted: {
      type: Boolean,
      default: false,
    },
    //expense transaction additional details
    title: {
      type: String,
    },
    // no additional details
    description: {
      type: String,
    },
    serialNumber: String,

    // for salary
    name: String,
    date: {
      from: String,
      to: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);

transactionSchema.pre('save', async function (next) {
  let transaction = this;
  if (this.isNew) {
    const transactionCount = await this.constructor.countDocuments({
      owner_id: transaction.owner_id,
    });
    transaction.serialNumber = generateSerialNumber(transactionCount);
  }
  next();
});

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
