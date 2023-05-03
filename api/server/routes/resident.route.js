const express = require('express');
const router = express.Router();
const {
	CreateResident,
	DeleteResident,
	ResidentsList,
	EditResident,
	ExportResidents,
	ResidentNames,
	ResidentLstName,
} = require('../controllers/resident.controller');

router.get('/residentslist', async (req, res) => {
	await ResidentsList(req, res);
});
router.post('/add', async (req, res) => {
	await CreateResident(req, res);
});
router.patch('/edit', async (req, res) => {
	await EditResident(req, res);
});
router.delete('/delete', async (req, res) => {
	await DeleteResident(req, res);
});
router.post('/export', async (req, res) => {
	await ExportResidents(req, res);
});
router.get('/name', async (req, res) => {
	await ResidentNames(req, res);
});
router.get('/last-name', async (req, res) => {
	await ResidentLstName(req, res);
});
module.exports.ResidentRoute = router;
