const express = require('express');
const router = express.Router();
const {
	Water,
	UpdateWater,
	UpdeteEletric,
	Electric,
	History,
	DifferencePrice,
	CreateWaterBill,
	ExportWaterBills,
	// Wb
} = require('../controllers/billing.controller');

router.get('/water', async (req, res) => {
	await Water(req, res);
});
router.patch('/water/edit', async (req, res) => {
	await UpdateWater(req, res);
});
router.post('/water/diff', async (req, res) => {
	await DifferencePrice(req, res);
});
router.post('/water/add', async (req, res) => {
	await CreateWaterBill(req, res);
});
router.post('/water/export', async (req, res) => {
	await ExportWaterBills(req, res);
	res.download(
		'/home/eznos/Desktop/BMS-Back-Office-API/Water-Bills-Data-Export.xlsx',
		'Water-Bills-Data-Export.xlsx',
		function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log('GGG');
			}
		}
	);
});
router.get('/electric', async (req, res) => {
	await Electric(req, res);
});
router.patch('/electric/edit', async (req, res) => {
	await UpdeteEletric(req, res);
});
router.get('/history', async (req, res) => {
	await History(req, res);
});

module.exports.BillRoute = router;
