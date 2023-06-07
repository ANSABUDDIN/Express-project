const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      private: true,
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    permissions: [{
      name: String,
      status: {
        type: Boolean,
        default: true
      }
    }],

    address: {
      line1: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    acc_type: {
      type: String,
      required: true,
      enum: ['individual', 'dealer', 'admin', 'police'],
    },

    // For corporations
    corporation_name: {
      type: String,
      default: null,
    },
    commercial_number: {
      type: String,
      default: null,
    },

    // Currency for corporations
    currency: {
      type: String,
    },
    
    nationality: {
      type: String,
    },
    // Payment information
    payment: {
      apiKey: String,
      secretKey: String,
      webhookSecret: String,
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    isLoginActive: {
      type: Boolean,
      default: true,
    },

    isUserNew: {
      type: Boolean,
      default: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Specific to police department
    name: String,
    pd_address: String,

    expiry_date: {
      type: Date,
      default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },

    ads: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
