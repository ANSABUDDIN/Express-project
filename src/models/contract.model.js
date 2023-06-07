const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const ClientSchema = require('./client.model');
const generateSerialNumber = require('../utils/serial');

const contractSchema = mongoose.Schema(
  {
    car_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Car',
      required: true,
    },
    owner_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    member_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Member',
    },
    ticket_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Ticket' },
    client: ClientSchema,
    rent: {
      pick_up: Date,
      drop_out: Date,
      modified_drop_out: Date,
      allowed_km: Number,
    },
    id_url: String,
    status: {
      type: String,
      enum: ['active', 'ended', 'terminated'],
    },
    package: {
      days: Number,
      price: Number,
    },
    startMileageReading: Number,
    endMileageReading: Number,
    totalAmount: Number,
    paid: Number,
    balance: Number,
    serialNumber: String,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contractSchema.plugin(toJSON);

contractSchema.pre('save', async function (next) {
  let contract = this;
  if (this.isNew) {
    const contractCount = await this.constructor.countDocuments({
      owner_id: contract.owner_id,
    });
    contract.serialNumber = generateSerialNumber(contractCount);
  }
  next();
});

/**
 * @typedef Contract
 */
const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
