const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const memberSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      private: true,
    },
    permissions: [{
      name: String,
      status: {
        type: Boolean,
        default: true
      }
    }],
    phone_number: {
      type: String,
      required: true,
    },
    owner_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
memberSchema.plugin(toJSON);
memberSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUsername] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
memberSchema.statics.isUsernameTaken = async function (username, excludeUsername) {
  const user = await this.findOne({ username, _id: { $ne: excludeUsername } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
memberSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

memberSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef Member
 */
const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
