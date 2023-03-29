const Joi = require('joi');

const editResidentScheme = Joi.object({
	zoneId: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
	waterZoneId: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
	buildingId: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
	roomNo: Joi.string().required(),
	roomType: Joi.string().required(),
	electricityNo: Joi.string().required(),
	electricityMeterNo: Joi.string().required(),
	waterNo: Joi.string().required(),
	waterMeterNo: Joi.string().required(),
	status: Joi.string().required(),
});

const editResidentDTO = (req) => {
	return {
		zoneId: req.zoneId,
		waterZoneId: req.waterZoneId,
		buildingId: req.buildingId,
		roomNo: req.roomNo,
		roomType: req.roomType,
		electricityNo: req.electricityNo,
		electricityMeterNo: req.electricityMeterNo,
		waterNo: req.waterNo,
		waterMeterNo: req.waterMeterNo,
		status: req.status,
	};
};

module.exports.EditResidentScheme = editResidentScheme;
module.exports.EditResidentDTO = editResidentDTO;
