const express = require('express');
const router = express.Router();
const { Building, CreateRoom, DeleteRoom, UpdateRoom } = require('../controllers/building.controller');

router.get('/buildings', async (req, res) => {
	await Building(req, res);
});
router.post('/buildings/add', async (req, res) => {
	await CreateRoom(req, res);
});
router.delete('/buildings/delete/:id', async (req, res) => {
	await DeleteRoom(req, res);
});
router.patch('/buildings/edit/:id', async (req, res) => {
	await UpdateRoom(req, res);
});
module.exports.BuildingRoute = router;
