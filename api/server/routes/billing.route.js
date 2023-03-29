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
	ExportHistory,
	CreateOldWaterBill,
	CreateElectricityBill,
	CreateOldElectricityBill,
} = require('../controllers/billing.controller');

// water
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
router.post('/water/add/old-bill', async (req, res) => {
	await CreateOldWaterBill(req, res);
});
router.post('/water/export', async (req, res) => {
	await ExportWaterBills(req, res);
});
// electricity
router.get('/electric', async (req, res) => {
	await Electric(req, res);
});
router.patch('/electric/edit', async (req, res) => {
	await UpdeteEletric(req, res);
});
router.post('/electric/add', async (req, res) => {
	await CreateElectricityBill(req, res);
});
router.post('/electric/add/old-bill', async (req, res) => {
	await CreateOldElectricityBill(req, res);
});
// history
router.get('/history', async (req, res) => {
	await History(req, res);
});
router.post('/history/export', async (req, res) => {
	await ExportHistory(req, res);
});

module.exports.BillRoute = router;
