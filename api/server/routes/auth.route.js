const express = require('express');
const router = express.Router();
const { Register } = require('../controllers/auth.controller');

router.post('/registers', async (req, res) => {
	await Register(req, res);
});

module.exports.AuthRoute = router;
