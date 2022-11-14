const express = require('express');
const router = express.Router();
const { AuthRoute } = require('./auth.route');
const { BillRoute } = require('./billing.route');
const { BuildingRoute } = require('./building.route');
const { UserRoute } = require('./user.route');
const { ResidentRoute } = require('./resident.route');

// * APIs Version 1
router.use('/auth', AuthRoute);
router.use('/billings', BillRoute);
router.use('/building', BuildingRoute);
router.use('/user', UserRoute);
router.use('/resident', ResidentRoute);
module.exports.RouteV1 = router;
