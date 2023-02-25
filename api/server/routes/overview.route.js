const express = require('express');
const router = express.Router();
const { ChartAndInfo, ExportOverviews } = require('../controllers/overview.controller');

router.get('/overviews', async (req, res) => {
	await ChartAndInfo(req, res);
});
router.post('/export', async (req, res) => {
	await ExportOverviews(req, res);
	res.download(
		'/home/eznos/Desktop/BMS-Back-Office-API/Overviews-Data-Export.xlsx',
		'Overviews-Data-Export.xlsx',
		function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log('GGG');
			}
		}
	);
});
module.exports.OverViewRoute = router;
