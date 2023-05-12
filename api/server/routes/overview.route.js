const express = require('express');
const router = express.Router();
const {
	ChartAndInfo,
	ExportOverviews,
	ZoneOverview,
	WaterZoneOverview,
	BuildingOverview,
	ChartUnit,
} = require('../controllers/overview.controller');

router.get('/overviews', async (req, res) => {
	await ChartAndInfo(req, res);
});
router.get('/overviews-unit', async (req, res) => {
	await ChartUnit(req, res);
});
router.post('/export', async (req, res) => {
	await ExportOverviews(req, res);
});
router.get('/sum-zone', async (req, res) => {
	await ZoneOverview(req, res);
});
router.get('/sum-water-zone', async (req, res) => {
	await WaterZoneOverview(req, res);
});
router.get('/sum-building', async (req, res) => {
	await BuildingOverview(req, res);
});
module.exports.OverViewRoute = router;
