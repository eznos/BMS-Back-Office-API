const express = require('express');
const router = express.Router();
const { AuthRoute } = require('./auth.route');

// * APIs Version 1
router.use('/auth', AuthRoute);

module.exports.RouteV1 = router;
