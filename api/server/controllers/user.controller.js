const { Response } = require('../../utils/response.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { NO_CONTENT_CODE, UNAUTHORIZED_CODE, OK_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { users } = require('../repositories/models');
const TokenList = require('./auth.controller');

const usersList = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const user = await users.findAll({
				attributes: [
					'id',
					'role',
					'rank',
					'affiliation',
					'firstName',
					'lastName',
					'gender',
					'email',
					'phoneNumber',
				],
				where: {
					deleted: 'false',
				},
			});
			if (!user) {
				return Response(res, SUCCESS_STATUS, OK_CODE, user);
			} else {
				return Response(res, SUCCESS_STATUS, OK_CODE, user);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

const editUser = async (req, res) => {
	const id = await req.query.id;
	const email = await req.body.email;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const user = await users.findOne({
				where: { id: id },
			});
			if (user) {
				await users.update({ email: email }, { where: { id: id } });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

const deleteUser = async (req, res) => {
	const id = await req.body.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const findUser = await users.findAll({ where: { id: id } });
			console.log(findUser);
			if (findUser) {
				const softDelete = await users.update({ deleted: true }, { where: { id: id } });
				if (!softDelete) {
					return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
				} else {
					return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
				}
			} else {
				return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

const editUserInfo = async (req, res) => {
	const id = await req.query.id;
	const data = req.body;
	try {
		const user = await users.findOne({ where: { id: id } });
		if (user) {
			await users.update({ rank: data.rank }, { where: { id: id } });
			await users.update({ affiliation: data.affiliation }, { where: { id: id } });
			await users.update({ firstName: data.firstName }, { where: { id: id } });
			await users.update({ lastName: data.lastName }, { where: { id: id } });
			await users.update({ gender: data.gender }, { where: { id: id } });
			await users.update({ email: data.email }, { where: { id: id } });
			await users.update({ phoneNumber: data.phoneNumber }, { where: { id: id } });
			await users.update({ profileUrl: data.profileUrl }, { where: { id: id } });
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

module.exports.UsersList = usersList;
module.exports.EditUser = editUser;
module.exports.DeleteUser = deleteUser;
module.exports.EditUserInfo = editUserInfo;
