const express = require('express');
const router = express.Router();
const { UsersList, EditUser, DeleteUser, EditUserInfo } = require('../controllers/user.controller');

router.get('/users', async (req, res) => {
	await UsersList(req, res);
});
router.patch('/users/edit', async (req, res) => {
	await EditUser(req, res);
});
router.delete('/users/delete', async (req, res) => {
	await DeleteUser(req, res);
});
router.patch('/users/edit-info', async (req, res) => {
	await EditUserInfo(req, res);
});
module.exports.UserRoute = router;
