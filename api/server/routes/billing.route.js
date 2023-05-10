const express = require('express');
const router = express.Router();
const {
	Water,
	UpdateWater,
	History,
	DifferencePrice,
	CreateWaterBill,
	ExportWaterBills,
	ExportHistory,
	CreateOldWaterBill,
	StatusChanger,
	HistoryAdmin,
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
router.post('/water/status-change', async (req, res) => {
	await StatusChanger(req, res);
});
// history
router.get('/history', async (req, res) => {
	await History(req, res);
});
router.post('/history/export', async (req, res) => {
	await ExportHistory(req, res);
});
router.get('/history/admin', async (req, res) => {
	await HistoryAdmin(req, res);
});
module.exports.BillRoute = router;
