const httpStatus = require('http-status');
const { Car, User, Ticket, Transaction, Contract, Member, BlackListedClient, Subscription } = require('../models');
const ApiError = require('../utils/ApiError');
const aws = require('aws-sdk');
const crypto = require('crypto');
const config = require('../config/config');
const stripe = require('stripe')(config.stripe.test_secret);
const mongoose = require('mongoose');
const generateSerialNumber = require('../utils/serial');

const { aws: AWSENV } = require('../config/config');

const paymentService = require('./payment.service');

aws.config.update({
  region: AWSENV.region,
  accessKeyId: AWSENV.accessKey,
  secretAccessKey: AWSENV.accessSecret,
  signature: 'v4',
});
const s3 = new aws.S3();
const S3_BUCKET = AWSENV.bucket;

/**
 * Create a new car
 * @param {Object} carData
 * @returns {Promise<User>}
 */
const createCar = async (carData) => {
  if (carData.vehicle_plate)
    if (await Car.isPlateTaken(carData.vehicle_plate)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'plate_already_taken');
    }
  return Car.create({ ...carData, lastOilCheck: carData.mileage });
};

const editCar = async (carData) => {
  const carDD = await Car.findOne({ _id: carData.id });
  if (carData.vehicle_plate && carData.vehicle_plate !== carDD.vehicle_plate)
    if (await Car.isPlateTaken(carData.vehicle_plate)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'plate_already_taken');
    }
  if (carDD.owner_id.toString() !== carData.owner_id.toString()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'not_owner');
  }
  await Car.updateOne({ _id: carData.id }, { $set: carData });
  return true;
};

const deleteCar = async (carData) => {
  const carDD = await Car.findOne({ _id: carData.id, owner_id: carData.owner_id });
  if (carDD.status === 'rented') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'car_rented');
  }
  await Car.deleteOne({ _id: carData.id });
  return true;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Get all cars
 * @returns {Promise<User>}
 */
const getCars = async () => {
  return Car.find({ status: 'available' })
    .populate({
      path: 'owner_id',
      select: [
        'address',
        'email',
        'first_name',
        'last_name',
        'acc_type',
        'phone_number',
        'corporation_name',
        'id',
        'currency',
      ],
    })
    .sort({ createdOn: -1 });
};

const searchCars = async (query) => {
  const dealers = await User.find({ 'address.city': { $regex: query.city, $options: 'i' } }).limit(100);

  const ownerIds = [];
  for (const dealer of dealers) {
    ownerIds.push(dealer._id);
  }

  const carData = await Car.find({
    owner_id: { $in: ownerIds },
    status: 'available',
    visibleTo: { $in: ['web', 'both'] },
  })
    .populate({
      path: 'owner_id',
      select: [
        'address',
        'email',
        'first_name',
        'last_name',
        'acc_type',
        'phone_number',
        'corporation_name',
        'id',
        'currency',
      ],
    })
    .sort({ createdOn: -1 })
    .limit(3);

  const filteredData = [];
  for (const car of carData) {
    const isCarBooked = await Ticket.find({
      car_id: car.id,
      isPaymentCompleted: true,
      $or: [
        { $and: [{ pick_up: { $gte: new Date(query.start) } }, { pick_up: { $lte: new Date(query.end) } }] },
        { $and: [{ drop_off: { $gte: new Date(query.start) } }, { drop_off: { $lte: new Date(query.end) } }] },
      ],
      isDeleted: false,
    });

    if (!isCarBooked.length) {
      filteredData.push(car);
    }
  }

  return filteredData;
};

const searchMeCars = async (query, owner_id) => {
  const carData = await Car.find({ owner_id: owner_id, status: 'available' })
    .populate({
      path: 'owner_id',
      select: [
        'address',
        'email',
        'first_name',
        'last_name',
        'acc_type',
        'phone_number',
        'corporation_name',
        'id',
        'currency',
      ],
    })
    .sort({ createdOn: -1 })
    .limit(100);

  const filteredData = [];
  for (const car of carData) {
    const isCarBooked = await Ticket.findOne({
      car_id: car.id,
      isPaymentCompleted: true,
      $or: [
        { $and: [{ pick_up: { $gte: new Date(query.start) } }, { pick_up: { $lte: new Date(query.end) } }] },
        { $and: [{ drop_off: { $gte: new Date(query.start) } }, { drop_off: { $lte: new Date(query.end) } }] },
      ],
      isDeleted: false,
    });
    if (!isCarBooked) {
      filteredData.push(car);
    }
  }

  return filteredData;
};

/**
 * Get all my cars
 * @returns {Promise<User>}
 */
const getMyCars = async (userId) => {
  const carData = await Car.find({ owner_id: userId, visibleTo: { $in: ['outlet', 'both'] } })
    .populate({
      path: 'owner_id',
      select: [
        'address',
        'email',
        'first_name',
        'last_name',
        'acc_type',
        'phone_number',
        'corporation_name',
        'id',
        'currency',
      ],
    })
    .sort({ createdAt: -1 });
  return carData;
};

const getAllMyCars = async (userId) => {
  const carData = await Car.find({ owner_id: userId })
    .populate({
      path: 'owner_id',
      select: [
        'address',
        'email',
        'first_name',
        'last_name',
        'acc_type',
        'phone_number',
        'corporation_name',
        'id',
        'currency',
      ],
    })
    .sort({ createdAt: -1 });
  return carData;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

const getAdmin = async () => {
  return User.findOne({ acc_type: 'admin' });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Create car ticket for user
 * @param {Object} reqData req data with payment+car info
 * @returns {Promise<User>}
 */
const createCarTicket = async (data) => {
  try {
    const carData = await Car.findById(data.car_id);
    if (!carData) {
      throw new ApiError(httpStatus.NOT_FOUND, 'invalid_car_id');
    }

    let payment;

    if (data.amount !== 0) {
      const customer = await stripe.customers.create({
        name: data.driver_info.first_name + ' ' + data.driver_info.last_name,
        address: data.driver_info.address,
        description: `For ticket payment on automaar`,
      });

      payment = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        description: 'Payment for online ticket booking',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }

    const newPayment = await Transaction.create({
      ...data,
      owner_id: carData.owner_id,
      payment_type: 'ticket',
      payment_id: data.amount !== 0 ? payment.id : undefined,
      isPaymentCompleted: data.amount === 0 ? true : false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
    const newTicket = await Ticket.create({
      ...data,
      owner_id: carData.owner_id,
      token_id: md5(`${Date.now()}_${carData.id}_${newPayment.id}`),
      transaction_id: newPayment.id,
      isPaymentCompleted: data.amount === 0 ? true : false,
    });
    return { newTicket, payment, newPayment, success: true };
  } catch (error) {
    console.log('stripe | error', error);
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

const cancelCarTicket = async (owner_id, data) => {
  try {
    const ticketData = await Ticket.findOne({ _id: data.id, owner_id: owner_id, isDeleted: false });
    if (!ticketData) {
      return { success: false, case: 'invalid_ticket_id' };
    }
    // Transaction part remaining
    if (ticketData.transaction_id) {
      const transactionData = await Transaction.findOne({ _id: ticketData.transaction_id });
      console.log(transactionData);
      if (transactionData.amount) {
        const refundId = await paymentService.adminRefund(transactionData.payment_intent);

        if (refundId.success) {
          await Transaction.create({
            owner_id: ticketData.owner_id,
            car_id: ticketData.car_id,
            payment_id: refundId.id,
            payment_type: 'ticket_refund',
            amount: transactionData.amount,
            vat: transactionData.vat,
            isPaymentCompleted: true,
            title: `Stripe Refund for cancellation of booking id ${ticketData.id}`,
          });
        } else {
          return { success: true, message: 'refund_failed' };
        }
      }
    }
    await Ticket.updateOne({ _id: data.id }, { isDeleted: true, deletedAt: Date.now() });

    return { success: true };
  } catch (error) {
    console.log('stripe | error', error);
    return {
      message: 'Payment Failed',
      success: false,
    };
  }
};

const cancelCarTicketEndUser = async (token_id) => {
  try {
    const ticketData = await Ticket.findOne({ token_id: token_id, isDeleted: false });
    if (!ticketData) {
      return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Automaar</title>
        </head>
        <body>
          <h1>Invalid Link, You can contact your dealership.</h1>
        </body>
      </html>
      `;
    }
    // Transaction part remaining
    if (ticketData.transaction_id) {
      const transactionData = await Transaction.findOne({ _id: ticketData.transaction_id });
      const refundId = await paymentService.adminRefund(transactionData.payment_id);

      if (refundId.success) {
        await Transaction.create({
          owner_id: ticketData.owner_id,
          car_id: ticketData.car_id,
          payment_id: refundId.id,
          payment_type: 'ticket_refund',
          amount: transactionData.amount,
          vat: transactionData.vat,
          isPaymentCompleted: true,
          title: `Stripe Refund for cancellation of booking id ${ticketData.id}`,
        });
      } else {
        return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Automaar</title>
        </head>
        <body>
          <h1>Refund failed, Kindly Contact Dealership.</h1>
        </body>
      </html>
      `;
      }
    }
    await Ticket.updateOne({ _id: data.id }, { isDeleted: true, deletedAt: Date.now() });

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Automaar</title>
      </head>
      <body>
        <h1>Refund Initiated, Your booking is cancelled.</h1>
      </body>
    </html>
    `;
  } catch (error) {
    console.log('stripe | error', error);
    // return {
    //   message: 'Payment Failed | Contact Dealership',
    //   success: false,
    // };
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Automaar</title>
      </head>
      <body>
        <h1>Refund failed, Kindly Contact Dealership.</h1>
      </body>
    </html>
    `;
  }
};

const createCarContract = async (data, user) => {
  const carData = await Car.findById(data.car_id);
  if (!carData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_car_id');
  } else if (carData.status === 'rented') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'car_rented');
  }

  const isBlackListed = await BlackListedClient.findOne({ passportId: data.client.passport.id_no });
  if (isBlackListed && !data.acceptBlacklisted) {
    // throw new ApiError(httpStatus.BAD_REQUEST, 'blacklisted');
    return {
      case: 'blacklisted',
      reason: isBlackListed.reason,
      createdAt: isBlackListed.createdAt,
    };
  }

  // const userContractCount = await Contract.countDocuments({
  //   owner_id: carData.owner_id,
  // });

  let dataToAdd = {
    ...data,
    status: 'active',
    owner_id: carData.owner_id,
    // serialNumber: generateSerialNumber(userContractCount),
  };
  if (user.member) dataToAdd.member_id = user.member._id;

  const newContract = await Contract.create(dataToAdd);
  let newPayment;
  if (data.payment_type === 'cash') {
    newPayment = await Transaction.create({
      ...data,
      isPaymentCompleted: true,
      owner_id: carData.owner_id,
      payment_type: data.payment_type,
      contract_id: newContract.id,
    });
  }
  else if (data.payment_type === 'bank') {
    newPayment = await Transaction.create({
      ...data,
      isPaymentCompleted: true,
      owner_id: carData.owner_id,
      payment_type: data.payment_type,
      contract_id: newContract.id,
    });
  }

  await Car.updateOne({ _id: data.car_id }, { $set: { status: 'rented', mileage: data.startMileageReading } });
  if (data.ticket_id) {
    await Ticket.updateOne({ _id: data.ticket_id }, { $set: { contract_id: newContract.id } });
  }
  return { newContract, newPayment };
};

const editCarContract = async (data, owner_id) => {
  const contractData = await Contract.updateOne(
    { _id: data.id, car_id: data.car_id, owner_id: owner_id },
    {
      $set: data,
    }
  );
  if (!contractData.matchedCount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_id');
  } else if (!contractData.modifiedCount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'no_changes_OR_no_owner');
  }
  return true;
};
const endCarContract = async (data, owner_id) => {
  console.log("data ====>"+JSON.stringify(data))
  const contractData = await Contract.updateOne(
    { _id: data.id, owner_id: owner_id, status: 'active' },
    {
      $set: { ...data, status: 'ended' },
    }
  );
  console.log("Contract Data ====>"+JSON.stringify(contractData))
  if (!contractData.matchedCount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_id');
  } else if (!contractData.modifiedCount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'no_changes_OR_no_owner');
  }
  console.log("After Contract Data")
  let newPayment;
  if (data.amount < 0) {
    newPayment = await Transaction.create({
      ...data,
      amount: -data.amount,
      owner_id,
      isPaymentCompleted: true,
      payment_type: 'refund',
      contract_id: data.id,
    });
  } else if (data.payment_type === 'cash') {
    newPayment = await Transaction.create({
      ...data,
      owner_id,
      isPaymentCompleted: true,
      payment_type: data.payment_type,
      contract_id: data.id,
    });
  }
  else if (data.payment_type === 'bank') {
    newPayment = await Transaction.create({
      ...data,
      owner_id,
      isPaymentCompleted: true,
      payment_type: data.payment_type,
      contract_id: data.id,
    });
  }
  if (data.endMileageReading - data.lastOilCheck > 5000) {
    await Car.updateOne(
      { _id: data.car_id },
      {
        $set: {
          status: 'available',
          mileage: data.endMileageReading,
          lastOilCheck: data.endMileageReading,
          remark: 'Oil change',
        },
      }
    );
  } else {
    await Car.updateOne({ _id: data.car_id }, { $set: { status: 'available', mileage: data.endMileageReading } });
  }
  return { newPayment };
};

const cancelContract = async (contract_id, owner_id) => {
  const contractData = await Contract.findOne({ _id: contract_id, owner_id: owner_id, status: 'active' });
  if (!contractData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_id');
  }

  // if (new Date(contractData.createdAt) < new Date(Date.now() - 7200000)) {
  //   return {
  //     success: false,
  //     case: 'cancel_not_allowed',
  //   };
  // }

  const ticketData = await Ticket.findOne({ contract_id: contract_id, isDeleted: false });
  if (ticketData) {
    return {
      success: false,
      case: 'booked_online',
    };
  }

  const userData = await User.findOne({ _id: contractData.owner_id });

  const allTransactions = await Transaction.find({ contract_id: contract_id });
  // const transactionData = await Transaction.findOne({ contract_id: contract_id });
  let totalCashAmount = 0;
  let totalBankAmount = 0;

  for (let transactionData of allTransactions) {
    if (transactionData.payment_type === 'online') {
      const refundId = await paymentService.initiateRefund(transactionData.payment_intent, userData);

      if (refundId.success) {
        await Transaction.create({
          owner_id: contractData.owner_id,
          car_id: contractData.car_id,
          contract_id: contract_id,
          payment_id: refundId.id,
          payment_type: 'refund',
          amount: transactionData.amount,
          vat: transactionData.vat,
          isPaymentCompleted: true,
          title: `Stripe Refund for cancellation of contract id ${contract_id}`,
        });
        totalBankAmount += transactionData.amount;
      } else {
        // Error in cash generation, refund via cash
        await Transaction.create({
          owner_id: contractData.owner_id,
          car_id: contractData.car_id,
          contract_id: contract_id,
          payment_type: 'withdraw',
          amount: transactionData.amount,
          vat: transactionData.vat,
          isPaymentCompleted: true,
          title: `Cash refund for cancellation of contract id ${contract_id}`,
        });
        totalCashAmount += transactionData.amount;
      }
    } else if (transactionData.payment_type === 'cash') {
      await Transaction.create({
        owner_id: contractData.owner_id,
        car_id: contractData.car_id,
        contract_id: contract_id,
        payment_type: 'withdraw',
        amount: transactionData.amount,
        vat: transactionData.vat,
        isPaymentCompleted: true,
        title: `Cash refund for cancellation of contract id ${contract_id}`,
      });
      totalCashAmount += transactionData.amount;
    }
    else if (transactionData.payment_type === 'bank') {
      await Transaction.create({
        owner_id: contractData.owner_id,
        car_id: contractData.car_id,
        contract_id: contract_id,
        payment_type: 'withdraw',
        amount: transactionData.amount,
        vat: transactionData.vat,
        isPaymentCompleted: true,
        title: `Cash refund for cancellation of contract id ${contract_id}`,
      });
      totalCashAmount += transactionData.amount;
    }
  }

  await Contract.updateOne({ _id: contract_id }, { $set: { status: 'terminated' } });

  return {
    success: true,
    case: 'refund_initiated',
    data: {
      bank_total: totalBankAmount,
      cash_total: totalCashAmount,
    },
  };
};

const addCashReceipt = async (data, owner_id) => {
  const contractData = await Contract.findOne({ _id: data.id, owner_id: owner_id, status: 'active' });
  if (!contractData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_id');
  }
  let newPayment;
  if (data.payment_type === 'cash') {
    newPayment = await Transaction.create({
      ...data,
      owner_id,
      isPaymentCompleted: true,
      payment_type: data.payment_type,
      contract_id: data.id,
    });
  }
  else if (data.payment_type === 'bank') {
    newPayment = await Transaction.create({
      ...data,
      owner_id,
      isPaymentCompleted: true,
      payment_type: data.payment_type,
      contract_id: data.id,
    });
  }

  if (data.totalAmount) {
    await Contract.updateOne(
      { _id: data.id },
      { $set: { totalAmount: data.totalAmount, paid: data.paid, balance: data.balance } }
    );
  }
  return { newPayment };
};

const getContractPayments = async (contractId, owner_id) => {
  const contractData = await Contract.findById(contractId);
  if (!contractData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_contract_id');
  } else if (contractData.owner_id.toString() != owner_id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'not_allowed');
  }
  const allTransactions = await Transaction.find({ contract_id: contractId, isPaymentCompleted: true }).lean();
  const filteredData = [];
  if (contractData.ticket_id) {
    const ticketData = await Ticket.findOne({ _id: contractData.ticket_id, isDeleted: false });
    const TicketTransaction = await Transaction.findOne({ _id: ticketData.transaction_id }).lean();
    if (TicketTransaction) {
      filteredData.push(TicketTransaction);
    }
  }
  for (const temp of allTransactions) {
    filteredData.push(temp);
  }
  return { allTransactions: filteredData };
};

const getAllPayments = async (owner_id) => {
  const allTransactions = await Transaction.find({ owner_id, payment_type: { $nin: ['ticket'] } }).lean();
  return { allTransactions };
};

const getCarContract = async (contractId, owner_id) => {
  const contractData = await Contract.findById(contractId).populate('car_id member_id ticket_id');
  const totalAmount = await Transaction.aggregate([
    { $match: { contract_id: mongoose.Types.ObjectId(contractId) } },
    {
      $group: {
        _id: '$contract_id',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  if (!contractData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_contract_id');
  } else if (contractData.owner_id.toString() != owner_id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'not_allowed');
  }
  let totalPayAmount = totalAmount && totalAmount.length ? totalAmount[0].totalAmount : 0;
  if (contractData.ticket_id) {
    const ticketTransactionData = await Transaction.findOne({ _id: contractData.ticket_id.transaction_id });
    totalPayAmount = totalPayAmount + ticketTransactionData.amount;
  }
  return {
    contractData: {
      ...contractData._doc,
      _id: undefined,
      id: contractData.id,
      totalPayAmount,
    },
  };
};

const listCarContract = async (owner_id) => {
  const contractData = await Contract.find({ owner_id: owner_id }).populate('car_id member_id').sort({ createdAt: -1 });
  return { contractData };
};

const signFile = async ({ uploadType, fileType, userId }) => {
  try {
    let contentType, fileName;
    const fileKey = md5(Date.now().toString() + userId);
    if (uploadType === 1) {
      contentType = 'application/' + fileType.toString();
      fileName = 'client/id/' + fileKey + '.' + fileType.toString();
    } else if (uploadType === 2) {
      contentType = 'image/' + fileType.toString();
      fileName = 'car/image/' + fileKey + '.' + fileType.toString();
    } else {
      return {
        success: false,
        case: 'request_invalid',
      };
    }
    const options = {
      Key: fileName,
      ContentType: contentType,
    };

    let s3Params = {
      Bucket: S3_BUCKET,
      Key: options.Key,
      Expires: 3600,
      ContentType: options.ContentType,
    };

    const temp = new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', s3Params, (err, url) => {
        err ? reject(err) : resolve(url);
      });
    });
    const signedData = {
      signUrl: await temp,
      fileUrl: options.Key,
    };
    return {
      signed_url: signedData.signUrl,
      file_url: signedData.fileUrl,
      valid_till: Date.now() + 3600 * 100,
    };
  } catch (err) {
    console.log(err);
  }
};

const addCashExpense = async (data, owner_id) => {
  const newPayment = await Transaction.create({
    ...data,
    owner_id,
    payment_type: 'expense',
    isPaymentCompleted: true,
  });
  return { newPayment };
};

const addWithdrawl = async (data, owner_id) => {
  const newPayment = await Transaction.create({
    ...data,
    owner_id,
    isPaymentCompleted: true,
  });
  return { newPayment };
};

const getCashExpenses = async (owner_id) => {
  const allExpenses = await Transaction.find({
    owner_id,
    payment_type: 'expense',
  })
    .sort({ createdAt: -1 })
    .lean();

  let filteredExpenses = [];

  for (const expense of allExpenses) {
    filteredExpenses.push({
      ...expense,
      __v: undefined,
      _id: undefined,
      id: expense._id,
    });
  }
  return filteredExpenses;
};

const getCashWithdrawl = async (owner_id) => {
  const allWithdrawls = await Transaction.find({
    owner_id,
    payment_type: 'withdraw',
  })
    .sort({ createdAt: -1 })
    .lean();

  let filteredWithdrawls = [];

  for (const expense of allWithdrawls) {
    filteredWithdrawls.push({
      ...expense,
      __v: undefined,
      _id: undefined,
      id: expense._id,
    });
  }
  return filteredWithdrawls;
};

const getSelf = async (id) => {
  const userData = await User.findById(id).lean();
  return {
    ...userData,
    isPaymentAllowed: Boolean(userData.payment && userData.payment.apiKey),
    stripeKey: userData.payment.apiKey,
    payment: undefined,
    __v: undefined,
    password: undefined,
    _id: undefined,
    id: userData._id,
  };
};

const getStripeEndpointSecret = async (id) => {
  const transactionData = await Transaction.findOne({ payment_id: id }).populate('owner_id');
  return transactionData.owner_id.payment.webhookSecret;
};

const getTickets = async (id) => {
  const ticketData = await Ticket.find({
    owner_id: id,
    isDeleted: false,
    contract_id: { $exists: false },
    isPaymentCompleted: true,
  })
    .sort({ createdAt: -1 })
    .populate('transaction_id car_id contract_id');
  return ticketData;
};

// createMember issue
const createMember = async (owner_id, data) => {
  if (await Member.isUsernameTaken(data.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'username_already_taken');
  }
  return Member.create({ ...data, owner_id });
};

const getMembers = async (owner_id) => {
  return Member.find({ owner_id });
};

const editMember = async (owner_id, data) => {
  // if (await Member.isUsernameTaken(data.username)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'username_already_taken');
  // }
  // const updatedMember = await Member.updateOne({ _id: data.id, owner_id: owner_id }, { $set: data });
  // return updatedMember.nModified;

  const member = await Member.findOne({ _id: data.id, owner_id: owner_id });
  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (data.username && (await Member.isUsernameTaken(data.username, data.id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'username_already_taken');
  }
  Object.assign(member, data);
  await member.save();
  return member;
};

const deleteMember = async (owner_id, member_id) => {
  const deletedMember = await Member.deleteOne({ _id: member_id, owner_id: owner_id });
  return deletedMember.deletedCount;
};

const createBlacklist = async (owner_id, passportId, reason) => {
  const contractData = await Contract.findOne({ owner_id: owner_id, 'client.passport.id_no': passportId });
  if (!contractData) {
    return {
      success: false,
      case: 'not_found',
    };
  }

  const data = {
    blockedOn: contractData.id,
    blockedBy: owner_id,
    passportId: passportId,
    reason: reason,
  };

  return BlackListedClient.create(data);
};

const removeBlacklist = async (owner_id, passportId) => {
  const deleteBlacklist = await BlackListedClient.deleteOne({ passportId: passportId, blockedBy: owner_id });
  return deleteBlacklist.deletedCount;
};

const getBlackListed = async (owner_id) => {
  const blackListedData = await BlackListedClient.find({ blockedBy: owner_id })
    .sort({ createdAt: -1 })
    .populate('blockedOn');

  const filteredData = [];
  for (const list of blackListedData) {
    filteredData.push({
      id: list._id,
      contract_id: list.blockedOn._id,
      client_details: list.blockedOn.client,
      passportId: list.passportId,
      reason: list.reason,
      createdAt: list.createdAt,
      blockedBy: list.blockedBy,
    });
  }
  return filteredData;
};

const getCarEarning = async (data, owner_id) => {
  let query = { car_id: data.car_id, isPaymentCompleted: true };

  const carData = await Car.findOne({ _id: data.car_id, owner_id: owner_id });
  if (!carData) {
    return {
      success: false,
      case: 'no_car_found',
    };
  }
  if (data.start) query.createdAt = { $gte: new Date(data.start) };
  if (data.end) query.createdAt = { ...query.createdAt, $lte: new Date(data.end) };

  const transactionData = await Transaction.find(query).populate('contract_id');
  return transactionData;
};

const getCapital = async (data, owner_id) => {
  const endDate = new Date(data.end).setHours(0, 0, 0, 0)
  const startDate = new Date(data.start).setHours(0, 0, 0, 0)
  const newCars = await Car.find({
    owner_id
    // createdAt: { $lte: endDate, $gte: startDate },
  });
  
  let carValue = 0;
  for (const car of newCars) {
    if (car.price) carValue += parseInt(car.price);
  }
  const getEarning = await Transaction.aggregate([
    { $match: { owner_id, payment_type: { $in: ['online', 'cash', 'bank'] } } },
    { $group: { _id: '$owner_id', totalAmount: { $sum: '$amount' } } },
  ]);

  const getUtilities = await Transaction.aggregate([
    { $match: { owner_id, payment_type: 'expense', title: 'utilities' } },
    { $group: { _id: '$owner_id', totalAmount: { $sum: '$amount' } } },
  ]);

  const getAdditional = await Transaction.aggregate([
    { $match: { owner_id, payment_type: 'expense', title: 'additional' } },
    { $group: { _id: '$owner_id', totalAmount: { $sum: '$amount' } } },
  ]); 

  const getVehicleExpense = await Transaction.aggregate([
    { $match: { owner_id, payment_type: 'expense', title: 'maintenance' } },
    { $group: { _id: '$owner_id', totalAmount: { $sum: '$amount' } } },
  ]);

  const getSalary = await Transaction.aggregate([
    { $match: { owner_id, payment_type: 'expense', title: 'salary' } },
    { $group: { _id: '$owner_id', totalAmount: { $sum: '$amount' } } },
  ]);

  const getTaxes = await Transaction.aggregate([
    { $match: { owner_id, payment_type: 'expense', title: 'tax' } },
    { $group: { _id: '$owner_id', totalAmount: { $sum: '$amount' } } },
  ]);

  return {
    carValue,
    earning: getEarning[0] ? parseFloat((getEarning[0].totalAmount / 100).toFixed(2)) : 0,
    utilities: getUtilities[0] ? parseFloat((getUtilities[0].totalAmount / 100).toFixed(2)) : 0,
    additional: getAdditional[0] ? parseFloat((getAdditional[0].totalAmount / 100).toFixed(2)) : 0,
    vehicle: getVehicleExpense[0] ? parseFloat((getVehicleExpense[0].totalAmount / 100).toFixed(2)) : 0,
    salary: getSalary[0] ? parseFloat((getSalary[0].totalAmount / 100).toFixed(2)) : 0,
    taxes: getTaxes[0] ? parseFloat((getTaxes[0].totalAmount / 100).toFixed(2)) : 0,
  };
};

const importContract = async (owner_id, data) => {
  const contractsToCreate = [],
    transactionToCreate = [];
  for (const contractData of data) {
    const carData = await Car.findById(contractData.car_id);
    if (!carData || carData.owner_id.toString() !== owner_id.toString()) {
      throw new ApiError(httpStatus.NOT_FOUND, `invalidcarid_${contractData.car_id}`);
    }

    let dataToAdd = {
      ...contractData,
      _id: new mongoose.Types.ObjectId(),
      status: 'ended',
      owner_id: carData.owner_id,
    };

    contractsToCreate.push(dataToAdd);
    transactionToCreate.push({
      ...contractData,
      isPaymentCompleted: true,
      owner_id: carData.owner_id,
      payment_type: contractData.payment_type,
      contract_id: dataToAdd._id,
    });
  }
  const session = await Contract.startSession();
  try {
    session.startTransaction();

    await Contract.insertMany(contractsToCreate, { session });
    await Transaction.insertMany(transactionToCreate, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  }
  session.endSession();

  return { success: true };
};

const md5 = (text) => {
  return crypto.createHash('md5').update(text, 'utf-8').digest('hex');
};

const addSubscription = async (subscriptionBody) => {
  const subscribedUser = await Subscription.findOne({email: subscriptionBody.email})
  await User.findOneAndUpdate({email: subscriptionBody.email}, {expiry_date: subscriptionBody.expireAt}, {new: true})
  if(subscribedUser) {
    return await Subscription.findOneAndUpdate({email: subscriptionBody.email}, subscriptionBody, {new: true})
  }else {
    return await Subscription.create(subscriptionBody)
  }
}

const getSubscription = async (userId) => {
  const user = await User.findById(userId)
  const subscriptionDetails = await Subscription.findOne({email: user.email})
  console.log(subscriptionDetails)
  return subscriptionDetails
}

const doesEmailExists = async (email) => {
  const user = await User.findOne({email})
  if(!user) {
    return false
  }
  return true
}


module.exports = {
  createCar,
  editCar,
  deleteCar,
  createUser,
  getCars,
  searchCars,
  searchMeCars,
  getMyCars,
  getAllMyCars,
  queryUsers,
  getUserByEmail,
  getUserById,
  createCarTicket,
  cancelCarTicket,
  cancelCarTicketEndUser,
  createCarContract,
  editCarContract,
  endCarContract,
  addCashReceipt,
  getContractPayments,
  getAllPayments,
  getCarContract,
  listCarContract,
  signFile,
  addCashExpense,
  addWithdrawl,
  getCashExpenses,
  getCashWithdrawl,
  updateUserById,
  getSelf,
  getStripeEndpointSecret,
  deleteUserById,
  getTickets,
  createMember,
  getMembers,
  editMember,
  deleteMember,
  createBlacklist,
  removeBlacklist,
  getBlackListed,
  cancelContract,
  getCarEarning,
  getAdmin,
  getCapital,
  importContract,
  addSubscription,
  getSubscription,
  doesEmailExists
};
