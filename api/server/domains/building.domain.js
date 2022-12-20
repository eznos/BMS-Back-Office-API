const Joi = require('joi');

const createRoomScheme = Joi.object({
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

const createRoomDTO = (req) => {
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

const idRoomScheme = Joi.object().keys({
	id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
});

const idRoomDTO = (req) => {
	return {
		id: req.id,
	};
};

const updateRoomScheme = Joi.object({
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

const updateRoomDTO = (req) => {
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

const createZoneScheme = Joi.object({
	zoneName: Joi.string().required(),
});

const createZoneDTO = (req) => {
	return {
		name: req.zoneName,
	};
};

const createWaterZoneScheme = Joi.object({
	waterZoneName: Joi.string().required(),
});
const createWaterZoneDTO = (req) => {
	return {
		name: req.waterZoneName,
	};
};

const createBuildingScheme = Joi.object({
	buildingName: Joi.string().required(),
	lat: Joi.string().required(),
	lng: Joi.string().required(),
});
const createBuildingDTO = (req) => {
	return {
		name: req.buildingName,
		lat: req.lat,
		lng: req.lng,
	};
};

module.exports.CreateRoomScheme = createRoomScheme;
module.exports.CreateRoomDTO = createRoomDTO;

module.exports.IdRoomScheme = idRoomScheme;
module.exports.IdRoomDTO = idRoomDTO;
module.exports.UpdateRoomScheme = updateRoomScheme;
module.exports.UpdateRoomDTO = updateRoomDTO;

module.exports.CreateZoneScheme = createZoneScheme;
module.exports.CreateZoneDTO = createZoneDTO;

module.exports.CreateWaterZoneScheme = createWaterZoneScheme;
module.exports.CreateWaterZoneDTO = createWaterZoneDTO;

module.exports.CreateBuildingScheme = createBuildingScheme;
module.exports.CreateBuildingDTO = createBuildingDTO;
