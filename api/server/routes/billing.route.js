const express = require('express');
const router = express.Router();
const { Water, UpdateWater, UpdeteEletric, Electric, History } = require('../controllers/billing.controller');

router.get('/water', async (req, res) => {
	await Water(req, res);
});
router.patch('/water/edit', async (req, res) => {
	await UpdateWater(req, res);
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
