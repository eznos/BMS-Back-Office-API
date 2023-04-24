const express = require('express');
const router = express.Router();
const {
	Register,
	Login,
	Token,
	Logout,
	ForgetPassword,
	RecoveryCode,
	EditPersonalInfo,
} = require('../controllers/auth.controller');

router.post('/registers', async (req, res) => {
	await Register(req, res);
});
router.post('/login', async (req, res) => {
	await Login(req, res);
});
router.post('/token', async (req, res) => {
	await Token(req, res);
});
router.post('/logout', async (req, res) => {
	await Logout(req, res);
});
router.post('/:email/forgot-password', async (req, res) => {
	await ForgetPassword(req, res);
});
router.patch('/:email/password', async (req, res) => {
	await RecoveryCode(req, res);
});
router.patch('/edit-info', async (req, res) => {
	await EditPersonalInfo(req, res);
});
module.exports.AuthRoute = router;
