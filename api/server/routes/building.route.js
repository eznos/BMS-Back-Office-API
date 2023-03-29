const express = require('express');
const router = express.Router();
const {
	Building,
	CreateRoom,
	DeleteRoom,
	UpdateRoom,
	CreateZone,
	ExportBuildings,
	GetZonesData,
	GetWaterZonesData,
	GetBuildingsData,
	CreateWaterZone,
	CreateBuilding,
	GetRoomsData,
} = require('../controllers/building.controller');

router.get('/buildings', async (req, res) => {
	await Building(req, res);
});
router.post('/buildings/add', async (req, res) => {
	await CreateRoom(req, res);
});
router.delete('/buildings/delete', async (req, res) => {
	await DeleteRoom(req, res);
});
router.patch('/buildings/edit/:id', async (req, res) => {
	await UpdateRoom(req, res);
});
router.post('/export', async (req, res) => {
	await ExportBuildings(req, res);
});
router.get('/data/zones', async (req, res) => {
	await GetZonesData(req, res);
});
router.get('/data/waterzone', async (req, res) => {
	await GetWaterZonesData(req, res);
});
router.get('/data/building', async (req, res) => {
	await GetBuildingsData(req, res);
});
router.get('/data/room', async (req, res) => {
	await GetRoomsData(req, res);
});
router.post('/buildings/add/zone', async (req, res) => {
	await CreateZone(req, res);
});
router.post('/buildings/add/water-zone', async (req, res) => {
	await CreateWaterZone(req, res);
});
router.post('/buildings/add/building', async (req, res) => {
	await CreateBuilding(req, res);
});
module.exports.BuildingRoute = router;
