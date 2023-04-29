const bcrypt = require('bcrypt');
const { Response, LoginResponse } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS, UNPROCESSABLE_ENTITY_STATUS } = require('../../constants/http-status.constant');
const {
	CREATED_CODE,
	OK_CODE,
	NO_CONTENT_CODE,
	UNAUTHORIZED_CODE,
} = require('../../constants/http-status-code.constant');
const {
	EMAIL_ALREADY_EXISTS,
	INVALID_REFRESH_TOKEN,
	INVALID_RECOVERY_CODE,
	INVALID_EMAIL_CODE,
} = require('../../constants/error-message.constant');
const { INVALID_USERNAME_OR_PASSWORD } = require('../../constants/error-message.constant');
const { LoginScheme } = require('../domains/auth.domain');
const { users } = require('../repositories/models');
const jwt = require('jsonwebtoken');
const OTPAuth = require('otpauth');
const tokenList = {};
const nodemailer = require('nodemailer');

const register = async (req, res) => {
	try {
		let user = req.body;
		console.log(user);
		const isExist = await users.findOne({ where: { email: user.email } });
		if (isExist) {
			return HandlerError(res, CustomError(EMAIL_ALREADY_EXISTS));
		}
		const newPassword = await bcrypt.hash(user.password, 10);
		await users.create({
			username: user.username,
			password: newPassword,
			rank: user.rank,
			affiliation: user.affiliation,
			first_name: user.first_name,
			last_name: user.last_name,
			gender: user.gender,
			email: user.email,
			phone_number: user.phone_number,
			profile_url: user.profile_url,
			role: 'user',
			deleted: false,
		});
		console.log('gg');
		return Response(res, SUCCESS_STATUS, CREATED_CODE);
	} catch (err) {
		return HandlerError(res, err);
	}
};

const login = async (req, res) => {
	try {
		let loginData = await LoginScheme.validateAsync(req.body);
		const user = await users.findOne({
			where: { username: loginData.username },
			attributes: [
				'id',
				'username',
				'password',
				'role',
				'rank',
				'firstName',
				'lastName',
				'affiliation',
				'profileUrl',
			],
		});
		if (user) {
			const hasUser = await bcrypt.compare(loginData.password, user.password);
			if (user.role === 'user' && hasUser) {
				const tokenPayload = {
					username: user.username,
					role: user.role,
				};
				const accessToken = jwt.sign(tokenPayload, process.env.secret, { expiresIn: process.env.tokenLife });
				const refreshToken = jwt.sign(tokenPayload, process.env.refreshTokenSecret, {
					expiresIn: process.env.refreshTokenLife,
				});
				const token = {
					access_token: accessToken,
					refresh_token: refreshToken,
				};
				tokenList[refreshToken] = token;
				return LoginResponse(res, SUCCESS_STATUS, OK_CODE, user, token);
			}
			if (user.role === 'admin' && hasUser) {
				const tokenPayload = {
					username: user.username,
					role: user.role,
				};
				const accessToken = jwt.sign(tokenPayload, process.env.secret, { expiresIn: process.env.tokenLife });
				const refreshToken = jwt.sign(tokenPayload, process.env.refreshTokenSecret, {
					expiresIn: process.env.refreshTokenLife,
				});
				const token = {
					access_token: accessToken,
					refresh_token: refreshToken,
				};
				tokenList[refreshToken] = token;
				return LoginResponse(res, SUCCESS_STATUS, OK_CODE, user, token);
			} else {
				return HandlerError(res, CustomError(INVALID_USERNAME_OR_PASSWORD));
			}
		} else {
			return HandlerError(res, CustomError(INVALID_USERNAME_OR_PASSWORD));
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const logout = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in tokenList) {
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const token = async (req, res) => {
	let loginData = req.body;
	if (loginData.result.token.refresh_token && loginData.result.token.refresh_token in tokenList) {
		const user = {
			username: loginData.username,
			role: loginData.role,
		};
		const token = jwt.sign(user, process.env.secret, { expiresIn: process.env.tokenLife });
		const response = {
			token: token,
		};
		// update the token in the list
		tokenList[loginData.result.token.refresh_token].token = token;
		res.status(200).json(response);
	} else {
		res.status(404).send('Invalid request');
	}
};
// OPT config
let totp = new OTPAuth.TOTP({
	issuer: 'ACME',
	label: 'AzureDiamond',
	algorithm: 'SHA1',
	digits: 6,
	period: 90,
	secret: 'Eznos', // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
});

const forgetPassword = async (req, res) => {
	const emailData = await req.params.email;
	try {
		const user = await users.findOne({
			where: { email: emailData },
			attributes: ['email'],
		});
		if (user) {
			let otpCode = totp.generate();
			const transporter = nodemailer.createTransport({
				service: 'hotmail',
				auth: {
					user: process.env.EZNOS_MAIL, // your email
					pass: process.env.EZNOS_PASSWORD, // your password
				},
			});
			console.log(process.env.EZNOS_MAIL);
			console.log(process.env.EZNOS_PASSWORD);
			// setup email data with unicode symbols
			const mailOptions = {
				from: process.env.EZNOS_MAIL, // sender
				to: emailData, // list of receivers
				subject: 'รหัส OTP ', // Mail subject
				text: 'รหัส OTP  ' + otpCode,
			};
			// send mail with defined transport object
			transporter.sendMail(mailOptions, function (err, info) {
				if (err) console.log(err);
				else console.log(info);
			});
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		} else {
			return Response(res, UNPROCESSABLE_ENTITY_STATUS, INVALID_EMAIL_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const recoveryCode = async (req, res) => {
	const emailData = await req.params.email;
	const otpData = await req.body.recovery_code;
	const type = await req.body.type;
	const password = await req.body.password;
	try {
		const user = await users.findOne({
			where: { email: emailData },
		});
		if (user && otpData && type == 'RESET') {
			let delta = totp.validate({
				token: otpData,
				window: 1,
			});
			if (delta == 0) {
				const hashPassword = await bcrypt.hash(password, 10);
				const newpassword = await users.update({ password: hashPassword }, { where: { email: emailData } });
				if (newpassword) {
					return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
				}
			} else {
				return HandlerError(res, CustomError(INVALID_RECOVERY_CODE));
			}
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const editPersonalInfo = async (req, res) => {
	const id = await req.query.id;
	const data = await req.body;
	// const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		// if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in tokenList.TokenList) {
		await users.update({ rank: data.rank }, { where: { id: id } });
		await users.update({ affiliation: data.affiliation }, { where: { id: id } });
		await users.update({ firstName: data.firstName }, { where: { id: id } });
		await users.update({ lastName: data.lastName }, { where: { id: id } });
		await users.update({ email: data.email }, { where: { id: id } });
		await users.update({ phoneNumber: data.phoneNumber }, { where: { id: id } });
		await users.update({ gender: data.gender }, { where: { id: id } });
		await users.update({ profileUrl: data.profileUrl }, { where: { id: id } });
		console.log(data.rank);
		return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		// } else {
		// 	return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		// }
	} catch (err) {
		return HandlerError(res, err);
	}
};

module.exports.Register = register;
module.exports.Login = login;
module.exports.Token = token;
module.exports.Logout = logout;
module.exports.ForgetPassword = forgetPassword;
module.exports.RecoveryCode = recoveryCode;
module.exports.TokenList = tokenList;
module.exports.EditPersonalInfo = editPersonalInfo;
