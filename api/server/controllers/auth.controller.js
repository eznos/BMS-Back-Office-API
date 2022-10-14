const bcrypt = require('bcrypt');
const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { CREATED_CODE } = require('../../constants/http-status-code.constant');
const { EMAIL_ALREADY_EXISTS } = require('../../constants/error-message.constant');
const { RegisterScheme, RegisterDTO } = require('../domains/auth.domain');
const { users } = require('../repositories/models');

const register = async (req, res) => {
	try {
		let user = await RegisterScheme.validateAsync(req.body);
		const isExist = await users.findOne({ where: { email: user.email } });
		if (isExist) {
			return HandlerError(res, CustomError(EMAIL_ALREADY_EXISTS));
		}
		user.password = await bcrypt.hash(user.password, 10);
		await users.create(RegisterDTO(user));
		return Response(res, SUCCESS_STATUS, CREATED_CODE);
	} catch (err) {
		return HandlerError(res, err);
	}
};

module.exports.Register = register;
