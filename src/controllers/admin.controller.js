const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { adminService, userService, tokenService, emailService } = require('../services');

const dashboardCount = catchAsync(async (req, res) => {
  const count = await adminService.getDashboardCounts(req.user);
  res.status(httpStatus.OK).send(count);
});

const getCorporations = catchAsync(async (req, res) => {
  const corporations = await adminService.getCorporations(req.user._id);
  res.status(httpStatus.OK).send(corporations);
});

const getDepartments = catchAsync(async (req, res) => {
  const departments = await adminService.getDepartments(req.user._id);
  res.status(httpStatus.OK).send(departments);
});

const getClients = catchAsync(async (req, res) => {
  const clients = await adminService.getClients(req.user, req.query);
  res.status(httpStatus.OK).send(clients);
});

const addPolice = catchAsync(async (req, res) => {
  const user = await userService.createUser({ ...req.body, isEmailVerified: true });
  res.status(httpStatus.CREATED).send({ user });
});

const editPolice = catchAsync(async (req, res) => {
  const updatedData = await adminService.editPolice(req.body);
  res.status(httpStatus.OK).send({ updatedData });
});

const deletePolice = catchAsync(async (req, res) => {
  const deletedData = await adminService.deletePolice(req.params.id);
  res.status(httpStatus.OK).send({ deletedData });
});

const toggleLogin = catchAsync(async (req, res) => {
  await adminService.toggleLogin(req.params.id);
  res.status(httpStatus.OK).send();
});

const getTickets = catchAsync(async (req, res) => {
  const data = await adminService.getTickets();
  res.status(httpStatus.OK).send(data);
});

const editCorporation = catchAsync(async (req, res) => {
  const data = await adminService.editCorporation(req.body);
  res.status(httpStatus.OK).send(data);
});

const deleteCorporation = catchAsync(async (req, res) => {
  const id = req.body.id
  const data = await adminService.deleteCorporationUser(id)
  res.status(httpStatus.OK).send(data);
})

const getBlackListed = catchAsync(async (req, res) => {
  const result = await adminService.getBlackListed(req.query.owner_id);
  res.send(result);
});

const getAds = catchAsync(async (req, res) => {
  const result = await adminService.getAds(req.body);
  res.send(result);
});

const postAd = catchAsync(async (req, res) => {
  const result = await adminService.postAd(req.user._id, req.body);
  res.send(result);
});
const deleteAd = catchAsync(async (req, res) => {
  const result = await adminService.deleteAd(req.user._id, req.body);
  res.send(result);
});

module.exports = {
  dashboardCount,
  getCorporations,
  getDepartments,
  getClients,
  addPolice,
  editPolice,
  deletePolice,
  toggleLogin,
  getTickets,
  editCorporation,
  getBlackListed,
  getAds,
  postAd,
  deleteAd,
  deleteCorporation
};
