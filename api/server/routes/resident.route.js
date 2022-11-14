const express = require('express');
const router = express.Router();
const { CreateResident, DeleteResident } = require('../controllers/resident.controller');

router.post('/add', async (req, res) => {
	await CreateResident(req, res);
});
router.delete('/delete', async (req, res) => {
	await DeleteResident(req, res);
});

module.exports.ResidentRoute = router;
