const Joi = require('joi');

const historyScheme = Joi.object({
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	rank: Joi.string()
		.required()
		.valid(
			'พล.ต.อ.',
			' พล.ต.ท.',
			'พล.ต.ต.',
			'พ.ต.อ.',
			'พ.ต.ท.',
			'พ.ต.ต.',
			'ร.ต.อ.',
			'ร.ต.ท.',
			'ร.ต.ต',
			'ด.ต.',
			'จ.ส.ต.',
			'ส.ต.อ.',
			'ส.ต.ท.',
			'ส.ต.ต.'
		),
});

module.exports.HistoryScheme = historyScheme;
