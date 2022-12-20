const express = require('express');
const router = express.Router();
const { Building, CreateRoom, DeleteRoom, UpdateRoom, CreateZone } = require('../controllers/building.controller');

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
router.post('/zones/add', async (req, res) => {
	await CreateZone(req, res);
});
module.exports.BuildingRoute = router;
