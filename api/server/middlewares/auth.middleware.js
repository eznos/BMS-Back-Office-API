require('dotenv').config();
const { INVALID_API_KEY } = require('../../constants/error-message.constant');
const { CustomError, HandlerError } = require('../../utils/error.util');

const authentication = (req, res, next) => {
	try {
		const apiKey = process.env.X_API_KEY || 'x-api-key';
		if (req.get('x-api-key') !== apiKey) {
			return HandlerError(res, CustomError(INVALID_API_KEY));
		}
		next();
	} catch (err) {
		return HandlerError(res, err);
	}
};

module.exports.Authentication = authentication;
