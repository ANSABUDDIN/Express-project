const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const CarSchema = mongoose.Schema(
  {
    vin: {
      type: String,
    },
    owner_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    inspection_date: {
      type: Date,
    },
    make_year: {
      type: String,
    },
    price: {
      type: String,
    },
    title_code: {
      type: String,
    },
    odometer: {
      type: String,
    },
    highlights: {
      type: String,
    },
    primary_damage: {
      type: String,
    },
    body_style: {
      type: String,
    },
    vehicle_type: {
      type: String,
    },
    vehicle_model: {
      type: String,
    },
    vehicle_plate: {
      type: String,
    },
    vehicle_image_url: {
      type: String,
    },
    color: {
      type: String,
    },
    engine_type: {
      type: String,
    },
    transmission: {
      type: String,
    },
    fuel: {
      type: String,
    },
    keys: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      default: 'available',
      enum: ['available', 'rented', 'maintenance'],
    },
    people_capacity: {
      type: Number,
    },
    mileage: {
      type: Number,
    },
    isAC: {
      type: Boolean,
    },
    visibleTo: {
      type: String,
      enum: ['web', 'outlet', 'both'],
    },
    seller_name: {
      type: String,
    },
    car_sale_type: {
      type: String,
      enum: ['rent', 'sale'],
    },
    package: [
      {
        days: Number,
        price: Number,
      },
    ],
    remark: String,
    lastOilCheck: {
      type: Number,
      default: 0,
    },
    featuredImage: String,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
CarSchema.plugin(toJSON);

/**
 * Check if plate is taken
 * @param {string} plate - The car's plate
 * @param {ObjectId} [excludeCarId] - The id of the car to be excluded
 * @returns {Promise<boolean>}
 */
CarSchema.statics.isPlateTaken = async function (plate, excludecarId) {
  const car = await this.findOne({ vehicle_plate: plate, _id: { $ne: excludecarId } });
  return !!car;
};

/**
 * @typedef Car
 */
const Car = mongoose.model('Car', CarSchema);

module.exports = Car;
