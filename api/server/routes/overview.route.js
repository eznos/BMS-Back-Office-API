const express = require('express');
const router = express.Router();
const { ChartAndInfo, ExportOverviews } = require('../controllers/overview.controller');

router.get('/overviews', async (req, res) => {
	await ChartAndInfo(req, res);
});
router.post('/export', async (req, res) => {
	await ExportOverviews(req, res);
});
module.exports.OverViewRoute = router;
