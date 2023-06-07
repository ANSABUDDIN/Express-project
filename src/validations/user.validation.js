const Joi = require('joi');

const createCar = {
  body: Joi.object().keys({
    vin: Joi.string(),
    price: Joi.string(),
    title_code: Joi.string(),
    make_year: Joi.string(),
    odometer: Joi.string(),
    highlights: Joi.string(),
    primary_damage: Joi.string(),
    body_style: Joi.string(),
    vehicle_type: Joi.string(),
    vehicle_model: Joi.string(),
    vehicle_image_url: Joi.string(),
    color: Joi.string(),
    vehicle_plate: Joi.string(),
    engine_type: Joi.string(),
    transmission: Joi.string(),
    fuel: Joi.string(),
    keys: Joi.string(),
    notes: Joi.string(),
    status: Joi.string().valid('available', 'rented', 'maintenance'),
    people_capacity: Joi.number(),
    mileage: Joi.number(),
    isAC: Joi.boolean(),
    visibleTo: Joi.string().valid('web', 'outlet', 'both'),
    seller_name: Joi.string(),
    car_sale_type: Joi.string().valid('rent', 'sale'),
    inspection_date: Joi.string(),
    remark: Joi.string(),
    package: Joi.array().items(
      Joi.object().keys({
        days: Joi.string(),
        price: Joi.string(),
      })
    ),
    featuredImage: Joi.string(),
  }),
};

const editCar = {
  body: Joi.object().keys({
    id: Joi.string(),
    vin: Joi.string(),
    price: Joi.string(),
    title_code: Joi.string(),
    make_year: Joi.string(),
    odometer: Joi.string(),
    highlights: Joi.string(),
    primary_damage: Joi.string(),
    body_style: Joi.string(),
    vehicle_type: Joi.string(),
    vehicle_model: Joi.string(),
    vehicle_image_url: Joi.string(),
    color: Joi.string(),
    vehicle_plate: Joi.string(),
    engine_type: Joi.string(),
    transmission: Joi.string(),
    fuel: Joi.string(),
    keys: Joi.string(),
    notes: Joi.string(),
    status: Joi.string().valid('available', 'rented', 'maintenance'),
    people_capacity: Joi.number(),
    mileage: Joi.number(),
    isAC: Joi.boolean(),
    visibleTo: Joi.string().valid('web', 'outlet', 'both'),
    seller_name: Joi.string(),
    remark: Joi.string(),
    car_sale_type: Joi.string().valid('rent', 'sale'),
    inspection_date: Joi.string(),
    package: Joi.array().items(
      Joi.object().keys({
        days: Joi.string(),
        price: Joi.string(),
      })
    ),
    featuredImage: Joi.string(),
  }),
};

const deleteCar = {
  body: Joi.object().keys({
    id: Joi.string(),
  }),
};

const bookCarTicket = {
  body: Joi.object().keys({
    car_id: Joi.string().required(),
    currency: Joi.string().required(),
    amount: Joi.number().required(),
    pick_up: Joi.string(),
    drop_off: Joi.string(),
    driver_info: {
      first_name: Joi.string(),
      last_name: Joi.string(),
      license_country: Joi.string(),
      address: {
        city: Joi.string(),
        country: Joi.string(),
        line1: Joi.string(),
        line2: Joi.string(),
        postal_code: Joi.string(),
        state: Joi.string(),
      },
      contact_details: {
        country_code: Joi.string(),
        phone_number: Joi.string(),
        email: Joi.string(),
      },
    },
  }),
};

const cancelCarTicket = {
  body: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const createContract = {
  body: Joi.object().keys({
    acceptBlacklisted: Joi.boolean(),
    car_id: Joi.string().required(),
    mileage: Joi.number(),
    owner_id: Joi.string().required(),
    ticket_id: Joi.string(),
    client: Joi.object().keys({
      name: Joi.object().keys({
        first_name: Joi.string().required(),
        mid_name: Joi.string(),
        last_name: Joi.string().required(),
      }),
      contact: Joi.string().required(),
      email: Joi.string(),
      client_type: Joi.string().valid('citizen', 'visitor', 'gulf'),
      passport: Joi.object().keys({
        id_no: Joi.string(),
        nationality: Joi.string(),
        doi: Joi.string(),
        dae: Joi.string(),
      }),
      visa: Joi.object().keys({
        visa_no: Joi.string(),
        doi: Joi.string(),
        doe: Joi.string(),
        poi: Joi.string(),
        sponsor_name: Joi.string(),
      }),
      insurance: Joi.object().keys({
        ins_type: Joi.string().required(),
        ins_amt: Joi.string(),
      }),
      driving_lic: Joi.object().keys({
        lic_no: Joi.string(),
        doi: Joi.string(),
        doe: Joi.string(),
        poi: Joi.string(),
      }),
      driver: Joi.object().keys({
        name: Joi.string(),
        lic_no: Joi.string(),
        doe: Joi.string(),
        dob: Joi.string(),
      }),
    }),
    rent: Joi.object().keys({
      pick_up: Joi.string().required(),
      drop_out: Joi.string().required(),
      allowed_km: Joi.number().required(),
    }),
    id_url: Joi.string(),
    package: Joi.object()
      .keys({
        days: Joi.string(),
        price: Joi.string(),
      })
      .required(),
    payment_id: Joi.string(),
    payment_type: Joi.string().valid('online', 'cash', 'bank').required(),
    amount: Joi.number().required(),
    vat: Joi.number().required(),
    startMileageReading: Joi.number(),
    endMileageReading: Joi.number(),
    totalAmount: Joi.number(),
    paid: Joi.number(),
    balance: Joi.number(),
  }),
};

const editContract = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    car_id: Joi.string().required(),
    owner_id: Joi.string().required(),
    client: Joi.object().keys({
      name: Joi.object().keys({
        first_name: Joi.string().required(),
        mid_name: Joi.string(),
        last_name: Joi.string().required(),
      }),
      contact: Joi.string().required(),
      email: Joi.string(),
      client_type: Joi.string().valid('citizen', 'visitor', 'gulf'),
      passport: Joi.object().keys({
        id_no: Joi.string(),
        nationality: Joi.string(),
        doi: Joi.string(),
        dae: Joi.string(),
      }),
      visa: Joi.object().keys({
        visa_no: Joi.string(),
        doi: Joi.string(),
        doe: Joi.string(),
        poi: Joi.string(),
        sponsor_name: Joi.string(),
      }),
      insurance: Joi.object().keys({
        ins_type: Joi.string().required(),
        ins_amt: Joi.string(),
      }),
      driving_lic: Joi.object().keys({
        lic_no: Joi.string(),
        doi: Joi.string(),
        doe: Joi.string(),
        poi: Joi.string(),
      }),
      driver: Joi.object().keys({
        name: Joi.string(),
        lic_no: Joi.string(),
        doe: Joi.string(),
        dob: Joi.string(),
      }),
    }),
    rent: Joi.object().keys({
      pick_up: Joi.string().required(),
      drop_out: Joi.string(),
      modified_drop_out: Joi.string(),
      allowed_km: Joi.number().required(),
    }),
    package: Joi.object()
      .keys({
        days: Joi.string().required(),
        price: Joi.string().required(),
      })
      .required(),
    id_url: Joi.string(),
    payment_id: Joi.string(),
    payment_type: Joi.string().valid('online', 'cash', 'bank'),
    startMileageReading: Joi.number(),
    endMileageReading: Joi.number(),
    totalAmount: Joi.number(),
    paid: Joi.number(),
    balance: Joi.number(),
  }),
};

const endContract = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    car_id: Joi.string().required(),
    mileage: Joi.number(),
    owner_id: Joi.string().required(),
    client: Joi.object().keys({
      name: Joi.object().keys({
        first_name: Joi.string().required(),
        mid_name: Joi.string(),
        last_name: Joi.string().required(),
      }),
      contact: Joi.string().required(),
      email: Joi.string(),
      client_type: Joi.string().valid('citizen', 'visitor', 'gulf'),
      passport: Joi.object().keys({
        id_no: Joi.string(),
        nationality: Joi.string(),
        doi: Joi.string(),
        dae: Joi.string(),
      }),
      visa: Joi.object().keys({
        visa_no: Joi.string(),
        doi: Joi.string(),
        doe: Joi.string(),
        poi: Joi.string(),
        sponsor_name: Joi.string(),
      }),
      insurance: Joi.object().keys({
        ins_type: Joi.string(),
        ins_amt: Joi.string(),
      }),
      driving_lic: Joi.object().keys({
        lic_no: Joi.string(),
        doi: Joi.string(),
        doe: Joi.string(),
        poi: Joi.string(),
      }),
      driver: Joi.object().keys({
        name: Joi.string(),
        lic_no: Joi.string(),
        doe: Joi.string(),
        dob: Joi.string(),
      }),
    }),
    rent: Joi.object().keys({
      pick_up: Joi.string().required(),
      drop_out: Joi.string(),
      modified_drop_out: Joi.string(),
      allowed_km: Joi.number().required(),
    }),
    package: Joi.object()
      .keys({
        days: Joi.string().required(),
        price: Joi.string().required(),
      })
      .required(),
    payment_id: Joi.string(),
    payment_type: Joi.string().valid('online', 'cash', 'bank').required(),
    amount: Joi.number().required(),
    vat: Joi.number().required(),
    startMileageReading: Joi.number(),
    endMileageReading: Joi.number(),
    totalAmount: Joi.number(),
    paid: Joi.number(),
    balance: Joi.number(),
  }),
};

const cashReceipt = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    car_id: Joi.string().required(),
    owner_id: Joi.string().required(),
    payment_id: Joi.string(),
    payment_type: Joi.string().valid('online', 'cash', 'bank').required(),
    amount: Joi.number().required(),
    vat: Joi.number().required(),
    totalAmount: Joi.number(),
    paid: Joi.number(),
    balance: Joi.number(),
  }),
};

const addExpense = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    amount: Joi.number().required(),
    car_id: Joi.string(),
    description: Joi.string(),
    name: Joi.string(),
    date: Joi.object().keys({
      from: Joi.string(),
      to: Joi.string(),
    }),
  }),
};

const addWithdrawl = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    description: Joi.string(),
    payment_type: Joi.string().valid('withdraw', 'withdraw_bank').required(),
  }),
};

const signFile = {
  body: Joi.object().keys({
    uploadType: Joi.number().valid(1, 2).required(),
    fileType: Joi.string().required(),
  }),
};

const paymentLink = {
  body: Joi.object().keys({
    contract_id: Joi.string().required(),
    amount: Joi.number().required(),
    vat: Joi.number().required(),
    currency: Joi.string().required(),
  }),
};

const savePaymentDetails = {
  body: Joi.object().keys({
    apiKey: Joi.string().required(),
    secretKey: Joi.string().required(),
    webhookSecret: Joi.string().required(),
  }),
};

const getCars = {
  query: Joi.object().keys({
    city: Joi.string().required(),
    start: Joi.string().required(),
    end: Joi.string().required(),
  }),
};

const getCarEarning = {
  query: Joi.object().keys({
    car_id: Joi.string().required(),
    start: Joi.string(),
    end: Joi.string(),
  }),
};

const searchMeCars = {
  query: Joi.object().keys({
    start: Joi.string().required(),
    end: Joi.string().required(),
  }),
};

const createMember = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    password: Joi.string().required(),
    username: Joi.string().required(),
    phone_number: Joi.string().required(),
    permissions: Joi.array().items(
      Joi.object().keys({
        name: Joi.string(),
        status: Joi.boolean(),
      })
    ),
  }),
};

const editMember = {
  body: Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    username: Joi.string().required(),
    phone_number: Joi.string().required(),
    permissions: Joi.array().items(
      Joi.object().keys({
        name: Joi.string(),
        status: Joi.boolean(),
      })
    ),
  }),
};

const deleteMember = {
  body: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const createBlacklist = {
  body: Joi.object().keys({
    passportId: Joi.string().required(),
    reason: Joi.string(),
  }),
};

const removeBlacklist = {
  body: Joi.object().keys({
    passportId: Joi.string().required(),
  }),
};

const contactUs = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string(),
    subject: Joi.string(),
    message: Joi.string(),
  }),
};

const getCapital = {
  query: Joi.object().keys({
    start: Joi.string().required(),
    end: Joi.string().required(),
  }),
};

const importContract = {
  body: Joi.array().items(
    Joi.object().keys({
      acceptBlacklisted: Joi.boolean(),
      car_id: Joi.string().required(),
      mileage: Joi.number(),
      owner_id: Joi.string().required(),
      ticket_id: Joi.string(),
      client: Joi.object().keys({
        name: Joi.object().keys({
          first_name: Joi.string().required(),
          mid_name: Joi.string(),
          last_name: Joi.string().required(),
        }),
        contact: Joi.string().required(),
        email: Joi.string(),
        client_type: Joi.string().valid('citizen', 'visitor', 'gulf'),
        passport: Joi.object().keys({
          id_no: Joi.string(),
          nationality: Joi.string(),
          doi: Joi.string(),
          dae: Joi.string(),
        }),
        visa: Joi.object().keys({
          visa_no: Joi.string(),
          doi: Joi.string(),
          doe: Joi.string(),
          poi: Joi.string(),
          sponsor_name: Joi.string(),
        }),
        insurance: Joi.object().keys({
          ins_type: Joi.string().required(),
          ins_amt: Joi.string(),
        }),
        driving_lic: Joi.object().keys({
          lic_no: Joi.string(),
          doi: Joi.string(),
          doe: Joi.string(),
          poi: Joi.string(),
        }),
        driver: Joi.object().keys({
          name: Joi.string(),
          lic_no: Joi.string(),
          doe: Joi.string(),
          dob: Joi.string(),
        }),
      }),
      rent: Joi.object().keys({
        pick_up: Joi.string().required(),
        drop_out: Joi.string().required(),
        allowed_km: Joi.number().required(),
      }),
      id_url: Joi.string(),
      package: Joi.object()
        .keys({
          days: Joi.string(),
          price: Joi.string(),
        })
        .required(),
      payment_id: Joi.string(),
      payment_type: Joi.string().valid('online', 'cash', 'bank').required(),
      amount: Joi.number().required(),
      vat: Joi.number().required(),
      startMileageReading: Joi.number(),
      endMileageReading: Joi.number(),
      totalAmount: Joi.number(),
      paid: Joi.number(),
      balance: Joi.number(),
    })
  ),
};

module.exports = {
  createCar,
  editCar,
  deleteCar,
  bookCarTicket,
  cancelCarTicket,
  signFile,
  createContract,
  editContract,
  endContract,
  cashReceipt,
  addExpense,
  addWithdrawl,
  paymentLink,
  savePaymentDetails,
  getCars,
  searchMeCars,
  createMember,
  editMember,
  deleteMember,
  createBlacklist,
  removeBlacklist,
  getCarEarning,
  contactUs,
  getCapital,
  importContract,
};
