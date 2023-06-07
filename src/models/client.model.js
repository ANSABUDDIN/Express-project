const mongoose = require('mongoose');

const ClientSchema = mongoose.Schema(
  {
    name: {
      first_name: String,
      mid_name: String,
      last_name: String,
    },
    contact: String,
    email: String,
    client_type: {
      type: String,
      enum: ['citizen', 'visitor', 'gulf'],
    },
    passport: {
      id_no: String,
      nationality: String,
      doi: Date,
      dae: Date,
    },
    visa: {
      visa_no: String,
      doi: Date,
      doe: Date,
      poi: String,
      sponsor_name: String,
    },
    insurance: {
      ins_type: String,
      ins_amt: String,
    },
    driving_lic: {
      lic_no: String,
      doi: Date,
      doe: Date,
      poi: String,
    },
    driver: {
      name: String,
      lic_no: String,
      doe: Date,
      dob: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = ClientSchema;
