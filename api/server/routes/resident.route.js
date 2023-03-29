const express = require('express');
const router = express.Router();
const {
	CreateResident,
	DeleteResident,
	ResidentsList,
	EditResident,
	SendMail,
	ExportResidents,
	ResidentNames,
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
router.post('/sendmail', async (req, res) => {
	await SendMail(req, res);
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
module.exports.ResidentRoute = router;
