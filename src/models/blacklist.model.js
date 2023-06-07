const mongoose = require('mongoose');
const ClientSchema = require('./client.model');

const BlackListedClientSchema = mongoose.Schema(
  {
    blockedOn: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Contract',
      required: true,
    },
    blockedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: { type: String },
    passportId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef BlackListedClient
 */
const BlackListedClient = mongoose.model('BlackListedClient', BlackListedClientSchema);

module.exports = BlackListedClient;
