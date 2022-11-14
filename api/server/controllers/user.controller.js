const { Response } = require('../../utils/response.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { NO_CONTENT_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
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
				res.status(200).json({ status: 'success', status_code: 200, result: { user_lists: user } });
			} else {
				res.status(200).json({ status: 'success', status_code: 200, result: { user_lists: user } });
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

const editUser = async (req, res) => {
	const id = await req.query.user_id;
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
	const id = await [req.query.users_id];
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const findUser = await users.findAll({ where: { id: [id] } });
			if (findUser) {
				const softDelete = await users.update({ deleted: true }, { where: { id: [id] } });
				if (!softDelete) {
					return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
				} else {
					return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
				}
			} else {
				return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
			}
		}
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

module.exports.UsersList = usersList;
module.exports.EditUser = editUser;
module.exports.DeleteUser = deleteUser;
