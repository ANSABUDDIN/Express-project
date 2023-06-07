const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    subscriptionPlan: {
        type: String,
        enum: ['basic', 'premium'],
        required: true,
    },
    duration: {
        type: String,
        enum: ['yearly', 'monthly'],
        required: true
    },
    price: {
        type: String,
        default: "0",
        required: true
    },
    email: {
      type: String,
      required: true,
    },
    expireAt: {
        type: Date,
        required: true
    }
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
