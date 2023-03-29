const express = require('express');
const router = express.Router();
const { CreateZone } = require('../controllers/building.controller');

router.post('/map/add', async (req, res) => {
	await CreateZone(req, res);
});
module.exports.MapRoute = router;
