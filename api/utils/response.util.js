const { RemoveNullableProperty } = require('./object.util');

const response = (res, status, code, result, err) => {
	return res.status(code).json(
		RemoveNullableProperty({
			status: status,
			status_code: code,
			result: result,
			error_message: err,
		})
	);
};

const loginResponse = (res, status, code, result, token) => {
	return res.status(code).json(
		RemoveNullableProperty({
			status: status,
			status_code: code,
			result: result,
			token: token,
		})
	);
};

module.exports.Response = response;
module.exports.LoginResponse = loginResponse;
