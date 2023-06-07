const httpStatus = require('http-status');
const userService = require('./user.service');
const emailService = require('./email.service');
const ApiError = require('../utils/ApiError');

const { Car, User, Ticket, Transaction, Contract, BlackListedClient } = require('../models');

const getDashboardCounts = async (user) => {
  const [corporations, police_departments, active_clients, inactive_clients, total_clients, user_data] = await Promise.all([
    User.countDocuments({ isEmailVerified: true, acc_type: { $in: ['individual', 'dealer'] } }),
    User.countDocuments({ isEmailVerified: true, acc_type: 'police' }),
    Contract.countDocuments({ status: 'active' }),
    Contract.countDocuments({ status: 'ended' }),
    Contract.countDocuments(),
    User.findOne({ _id: user._id }),
  ]);
  const active_clients_police = await Contract.find({ status: 'active' }).populate('car_id owner_id').lean();
  const inactive_clients_police = await Contract.find({ status: 'ended' }).populate('car_id owner_id').lean();
  const total_clients_poice = await Contract.find({}).populate('car_id owner_id').lean();
  const active_clients_police_count = getContractAccordingToNationality(user, active_clients_police).length;
  const inactive_clients_police_count = getContractAccordingToNationality(user, inactive_clients_police).length;
  const total_clients_poice_count = getContractAccordingToNationality(user, total_clients_poice).length;
  return {
    count:
      user.acc_type == 'admin'
        ? { corporations, police_departments, active_clients, inactive_clients, total_clients }
        : {
            active_clients: active_clients_police_count,
            inactive_clients: inactive_clients_police_count,
            total_clients: total_clients_poice_count,
          },
    user_data,
  };
};

const getCorporations = async (user_id) => {
  const corporations = await User.find({ isEmailVerified: true, acc_type: { $in: ['individual', 'dealer'] } })
    .sort({ createdAt: -1 })
    .lean();
  const filteredCorporations = [];
  for (const corporate of corporations) {
    filteredCorporations.push({
      ...corporate,
      payment: undefined,
      id: corporate._id,
      _id: undefined,
      __v: undefined,
      password: undefined,
    });
  }
  return { corporations: filteredCorporations };
};

const getDepartments = async (user_id) => {
  const departments = await User.find({ isEmailVerified: true, acc_type: { $in: ['police'] } });
  return { departments };
};

const getContractAccordingToNationality = (user, clients) => {
  const filteredClients = [];
  if (user.acc_type !== 'admin') {
    for (let client of clients) {
      if (
        client.owner_id.address.country.toString().toLowerCase().trim() === user.nationality.toString().toLowerCase().trim()
      ) {
        filteredClients.push(client);
      }
    }
  }
  return filteredClients;
};

const getClients = async (user, data) => {
  const { start, end } = data;
  let clients;
  if (start && end) {
    clients = await Contract.find({
      'rent.pick_up': { $gte: new Date(start) },
      'rent.drop_out': { $lte: new Date(end) },
    })
      .populate('car_id owner_id')
      .lean();
  } else if (start) {
    clients = await Contract.find({ 'rent.pick_up': { $gte: new Date(start) } })
      .populate('car_id owner_id')
      .lean();
  } else if (end) {
    clients = await Contract.find({ 'rent.drop_out': { $lte: new Date(end) } })
      .populate('car_id owner_id')
      .lean();
  } else {
    clients = await Contract.find({}).populate('car_id owner_id').lean();
  }
  if (user.acc_type !== 'admin') {
    clients = getContractAccordingToNationality(user, clients);
  }
  const filteredClients = [];
  for (let client of clients) {
    let isBlackListed = false;
    if (client.client && client.client.passport && client.client.passport.id_no)
      isBlackListed = await BlackListedClient.findOne({ passportId: client.client.passport.id_no });
    filteredClients.push({ ...client, isBlackListed: Boolean(isBlackListed) });
  }
  return { filteredClients };
};

const editPolice = async (data) => {
  const updatedData = await userService.updateUserById(data.id, { ...data });
  return updatedData;
};

const editCorporation = async (data) => {
  const updatedData = await userService.updateUserById(data.id, { ...data });
  return updatedData;
};

const deleteCorporationUser = async (data) => {
  const deletedData = await userService.deleteUserById(data);
  return deletedData;
};

const deletePolice = async (user_id) => {
  const deletedData = await userService.deleteUserById(user_id);
  return deletedData;
};

const toggleLogin = async (user_id) => {
  const user = await userService.getUserById(user_id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'invalid_id');
  }
  if (!user.isLoginActive) await emailService.sendActivationEmail(user);
  await userService.updateUserById(user_id, { isLoginActive: Boolean(!user.isLoginActive), isUserNew: false });
};

const getTickets = async () => {
  const AllTickets = await Ticket.find().populate('transaction_id car_id contract_id');
  return AllTickets;
};

const getBlackListed = async (owner_id) => {
  let query = {};
  if (owner_id) query = { blockedBy: owner_id };

  const blackListedData = await BlackListedClient.find(query).sort({ createdAt: -1 }).populate('blockedOn blockedBy');

  const filteredData = [];
  for (const list of blackListedData) {
    filteredData.push({
      id: list._id,
      contract_id: list.blockedOn._id,
      client_details: list.blockedOn.client,
      passportId: list.passportId,
      createdAt: list.createdAt,
      blockedBy: {
        id: list.blockedBy.id,
        email: list.blockedBy.email,
        address: list.blockedBy.address,
        first_name: list.blockedBy.first_name,
        last_name: list.blockedBy.last_name,
        phone_number: list.blockedBy.phone_number,
        acc_type: list.blockedBy.acc_type,
        corporation_name: list.blockedBy.corporation_name,
        commercial_number: list.blockedBy.commercial_number,
      },
    });
  }
  return filteredData;
};

const getAds = async (data) => {
  const userData = await User.findOne({ acc_type: 'admin' });
  return userData.ads;
};

const postAd = async (owner_id, data) => {
  await User.updateOne({ _id: owner_id }, { $push: { ads: data.adURL } });
  return { message: 'updated' };
};

const deleteAd = async (owner_id, data) => {
  await User.updateOne({ _id: owner_id }, { $pull: { ads: data.adURL } });
  return { message: 'deleted' };
};

module.exports = {
  getDashboardCounts,
  getCorporations,
  getDepartments,
  getClients,
  editPolice,
  deletePolice,
  toggleLogin,
  getTickets,
  editCorporation,
  getBlackListed,
  getAds,
  postAd,
  deleteAd,
  deleteCorporationUser,
};
