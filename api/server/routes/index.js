//importing modules
const express = require('express');
const userController = require('../controllers/userController');
const billingsController = require('../controllers/billingsController');
const { signup, login, logout, loginUser, recoveryCode, showUser } =
	userController;
const { history, water, electricity } = billingsController;
const userAuth = require('../Middlewares/userAuth');

const router = express.Router();

//endpoint
//passing the middleware function to the signup
router.post('/auth/registers', userAuth.saveUser, signup);
router.post('/auth/:email/forgot-password', userAuth.emailcheck);
router.patch('/auth/:email/password', recoveryCode);
router.post('/login', login);
router.post('/logout', logout);
router.post('/auth/login-user', loginUser);
router.get('/history', history);
router.get('/billings/water', water);
router.get('/billings/electric', electricity);
router.get('/users', showUser);
module.exports = router;
