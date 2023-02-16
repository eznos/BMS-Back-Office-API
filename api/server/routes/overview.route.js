const express = require('express');
const router = express.Router();
const { ChartAndInfo } = require('../controllers/overview.controller');

router.get('/overviews', async (req, res) => {
	await ChartAndInfo(req, res);
});

module.exports.OverViewRoute = router;
