const Joi = require('joi');

const registerScheme = Joi.object({
	rank: Joi.string().optional(),
	affiliation: Joi.string().optional(),
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	email: Joi.string().email().required(),
	phone_number: Joi.string().optional(),
	gender: Joi.string().optional(),
	username: Joi.string().required(),
	password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$')).required(),
	profile_url: Joi.string().optional(),
});

const registerDTO = (req) => {
	return {
		rank: req.rank || null,
		role: req.role || 'user',
		affiliation: req.affiliation || null,
		firstName: req.first_name,
		lastName: req.last_name,
		email: req.email,
		phoneNumber: req.phone_number || null,
		gender: req.gender || null,
		username: req.username,
		password: req.password,
		profileUrl: req.profile_url || null,
		deleted: false,
	};
};

const loginScheme = Joi.object({
	username: Joi.string().required(),
	password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$')).required(),
});
const loginDTO = (req) => {
	return {
		rank: req.rank || null,
		role: req.role || 'user',
		affiliation: req.affiliation || null,
		firstName: req.first_name,
		lastName: req.last_name,
		email: req.email,
		phoneNumber: req.phoneNumber || null,
		gender: req.gender || null,
		username: req.username,
		profileUrl: req.profileUrl || null,
	};
};

module.exports.RegisterScheme = registerScheme;
module.exports.RegisterDTO = registerDTO;

module.exports.LoginScheme = loginScheme;
module.exports.LoginDTO = loginDTO;
