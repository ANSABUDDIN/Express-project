const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, emailService } = require('../services');

const createCar = catchAsync(async (req, res) => {
  const car = await userService.createCar({ ...req.body, owner_id: req.user._id });
  res.status(httpStatus.CREATED).send(car);
});

const editCar = catchAsync(async (req, res) => {
  const car = await userService.editCar({ ...req.body, owner_id: req.user._id });
  res.status(httpStatus.CREATED).send(car);
});

const deleteCar = catchAsync(async (req, res) => {
  const car = await userService.deleteCar({ ...req.body, owner_id: req.user._id });
  res.status(httpStatus.CREATED).send(car);
});

const getCars = catchAsync(async (req, res) => {
  const result = await userService.getCars();
  res.send(result);
});

const searchCars = catchAsync(async (req, res) => {
  const result = await userService.searchCars(req.query);
  res.send(result);
});

const searchMeCars = catchAsync(async (req, res) => {
  const result = await userService.searchMeCars(req.query, req.user._id);
  res.send(result);
});

const getMyCars = catchAsync(async (req, res) => {
  const result = await userService.getMyCars(req.user._id);
  res.send(result);
});

const getAllMyCars = catchAsync(async (req, res) => {
  const result = await userService.getAllMyCars(req.user._id);
  res.send(result);
});

const createTicket = catchAsync(async (req, res) => {
  const result = await userService.createCarTicket(req.body);
  res.send(result);
});

const cancelCarTicket = catchAsync(async (req, res) => {
  const result = await userService.cancelCarTicket(req.user._id, req.body);
  res.send(result);
});

const cancelCarTicketEndUser = catchAsync(async (req, res) => {
  const result = await userService.cancelCarTicketEndUser(req.params.id);
  res.setHeader('Content-Type', 'text/html');
  res.send(result);
});

const createContract = catchAsync(async (req, res) => {
  const result = await userService.createCarContract(req.body, req.user);
  if (result.case === 'blacklisted') {
    return res.status(400).json(result);
  }
  res.send(result);
});

const editContract = catchAsync(async (req, res) => {
  const result = await userService.editCarContract(req.body, req.user._id);
  res.send(result);
});

const endContract = catchAsync(async (req, res) => {
  const result = await userService.endCarContract(req.body, req.user._id);
  res.send(result);
});

const cancelContract = catchAsync(async (req, res) => {
  const result = await userService.cancelContract(req.params.id, req.user._id);
  res.send(result);
});

const cashReceipt = catchAsync(async (req, res) => {
  const result = await userService.addCashReceipt(req.body, req.user._id);
  res.send(result);
});

const contractPayments = catchAsync(async (req, res) => {
  const result = await userService.getContractPayments(req.params.id, req.user._id);
  res.send(result);
});

const allPayments = catchAsync(async (req, res) => {
  const result = await userService.getAllPayments(req.user._id);
  res.send(result);
});

const getContract = catchAsync(async (req, res) => {
  const result = await userService.getCarContract(req.params.id, req.user._id);
  res.send(result);
});

const listContracts = catchAsync(async (req, res) => {
  const result = await userService.listCarContract(req.user._id);
  res.send(result);
});

const signFile = catchAsync(async (req, res) => {
  const result = await userService.signFile({ ...req.body, userId: req.user._id });
  res.send(result);
});

const addExpense = catchAsync(async (req, res) => {
  const result = await userService.addCashExpense(req.body, req.user._id);
  res.send(result);
});

const getExpense = catchAsync(async (req, res) => {
  const result = await userService.getCashExpenses(req.user._id);
  res.send(result);
});

const getWithdrawl = catchAsync(async (req, res) => {
  const result = await userService.getCashWithdrawl(req.user._id);
  res.send(result);
});

const addWithdrawl = catchAsync(async (req, res) => {
  const result = await userService.addWithdrawl(req.body, req.user._id);
  res.send(result);
});

const getSelf = catchAsync(async (req, res) => {
  const result = await userService.getSelf(req.user._id);
  res.send(result);
});

const getTickets = catchAsync(async (req, res) => {
  const result = await userService.getTickets(req.user._id);
  res.send(result);
});

const createMember = catchAsync(async (req, res) => {
  const result = await userService.createMember(req.user._id, req.body);
  res.send(result);
});

const getMembers = catchAsync(async (req, res) => {
  const result = await userService.getMembers(req.user._id);
  res.send(result);
});

const editMember = catchAsync(async (req, res) => {
  const result = await userService.editMember(req.user._id, req.body);
  res.send(result);
});

const deleteMember = catchAsync(async (req, res) => {
  const result = await userService.deleteMember(req.user._id, req.body.id);
  res.status(200).json(result);
});

const getBlackListed = catchAsync(async (req, res) => {
  const result = await userService.getBlackListed(req.user._id);
  res.send(result);
});

const createBlacklist = catchAsync(async (req, res) => {
  const result = await userService.createBlacklist(req.user._id, req.body.passportId, req.body.reason);
  res.send(result);
});

const removeBlacklist = catchAsync(async (req, res) => {
  const result = await userService.removeBlacklist(req.user._id, req.body.passportId);
  res.status(200).json(result);
});

const getCarEarning = catchAsync(async (req, res) => {
  const result = await userService.getCarEarning(req.query, req.user._id);
  res.send(result);
});

const contactUs = catchAsync(async (req, res) => {
  const result = await userService.getAdmin();
  await emailService.sendContactusEmail(result, req.body);
  res.status(200).json({ success: true });
});

const getCapital = catchAsync(async (req, res) => {
  const result = await userService.getCapital(req.query, req.user._id);
  res.status(200).json(result);
});

const importContract = catchAsync(async (req, res) => {
  const result = await userService.importContract(req.user._id, req.body);
  res.status(200).json(result);
});

const addSubscription = catchAsync(async (req, res) => {
  const result = await userService.addSubscription(req.body)
  res.status(200).json(result)
})

const getSubscription = catchAsync(async (req, res) => {
  const result = await userService.getSubscription(req.user._id)
  res.status(200).json(result)
})

const doesEmailExists = catchAsync(async (req, res) => {
  const email = req.params.email
  const result = await userService.doesEmailExists(email)
  res.status(200).json({result})
})

module.exports = {
  createCar,
  editCar,
  deleteCar,
  getCars,
  searchCars,
  searchMeCars,
  getMyCars,
  getAllMyCars,
  createTicket,
  cancelCarTicket,
  cancelCarTicketEndUser,
  createContract,
  editContract,
  endContract,
  cashReceipt,
  contractPayments,
  allPayments,
  getContract,
  listContracts,
  signFile,
  addExpense,
  addWithdrawl,
  getExpense,
  getWithdrawl,
  getSelf,
  getTickets,
  createMember,
  getMembers,
  editMember,
  deleteMember,
  getBlackListed,
  createBlacklist,
  removeBlacklist,
  cancelContract,
  getCarEarning,
  contactUs,
  getCapital,
  importContract,
  addSubscription,
  getSubscription,
  doesEmailExists
};
