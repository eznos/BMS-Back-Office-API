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

module.exports.Response = response;
