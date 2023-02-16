const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, UNAUTHORIZED_CODE, OK_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { rooms, zones, buildings, waterZones, accommodations } = require('../repositories/models');
const { UpdateRoomScheme, UpdateRoomDTO } = require('../domains/building.domain');
const TokenList = require('./auth.controller');
const building = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const room = await rooms.findAll({
				include: [
					{
						model: zones,
					},
					{
						model: waterZones,
					},
					{
						model: buildings,
					},
				],
				attributes: [
					'id',
					'building_id',
					'roomNo',
					'roomType',
					'waterNo',
					'waterMeterNo',
					'electricityNo',
					'electricityMeterNo',
					'status',
				],
			});
			if (!room) {
				return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
			} else {
				return Response(res, SUCCESS_STATUS, OK_CODE, room);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const createRoom = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const room = await req.body;
	try {
		const findZone = await zones.findOne({ where: { id: room.zoneId } });
		const findWaterZone = await waterZones.findOne({ where: { id: room.waterZoneId } });
		const findbuilding = await buildings.findOne({ where: { id: room.buildingId } });
		if (!findZone || !findWaterZone || !findbuilding) {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
		if (findZone && findWaterZone && findbuilding) {
			if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
				const newRoom = await rooms.create(room);
				if (newRoom) {
					return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
				} else {
					return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
				}
			} else {
				return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
			}
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const deleteRoom = async (req, res) => {
	const id = await req.body.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const room = await rooms.findAll({ where: { id: id } });
			const accommodation = await accommodations.findAll({ where: { room_id: id } });
			if (accommodation && room) {
				await accommodations.update({ roomId: null }, { where: { room_id: id } });
				await accommodations.update({ deleted: true }, { where: { room_id: id } });
				await accommodations.update({ host: false }, { where: { room_id: id } });
				rooms.destroy({ where: { id: id } });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			}
			if (room && !accommodation) {
				rooms.destroy({ where: { id: id } });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const updateRoom = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const id = await req.params.id;
	const data = await UpdateRoomScheme.validateAsync(req.body);
	try {
		const room = await rooms.findOne({
			while: {
				id: id,
			},
		});
		if (room) {
			if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
				await rooms.update({ zoneId: UpdateRoomDTO(data).zoneId }, { where: { id: id } });
				await rooms.update({ waterZoneId: UpdateRoomDTO(data).waterZoneId }, { where: { id: id } });
				await rooms.update({ buildingId: UpdateRoomDTO(data).buildingId }, { where: { id: id } });
				await rooms.update({ roomNo: UpdateRoomDTO(data).roomNo }, { where: { id: id } });
				// await rooms.update({ electricityNo: UpdateRoomDTO(data).electricityNo }, { where: { id: id } });
				// await rooms.update(
				// 	{ electricityMeterNo: UpdateRoomDTO(data).electricityMeterNo },
				// 	{ where: { id: id } }
				// );
				await rooms.update({ waterNo: UpdateRoomDTO(data).waterNo }, { where: { id: id } });
				await rooms.update({ waterMeterNo: UpdateRoomDTO(data).waterMeterNo }, { where: { id: id } });
				await rooms.update({ roomType: UpdateRoomDTO(data).roomType }, { where: { id: id } });
				await rooms.update({ status: UpdateRoomDTO(data).status }, { where: { id: id } });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			} else {
				return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
			}
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const createZone = async (req, res) => {
	let data = await req.body;
	try {
		const zone = await zones.findOne({
			where: {
				name: data.zoneName,
			},
		});
		const waterZone = await waterZones.findOne({
			where: {
				name: data.waterZoneName,
			},
		});
		const building = await buildings.findOne({
			where: {
				name: data.buildingName,
			},
		});
		// not create
		if (zone && waterZone && building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'gg');
		}
		// create a new zone and water zone
		else if (!!zone && !!waterZone && building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'Eznos');
		}
		// create a new zone and building
		else if (!!zone && waterZone && !!building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'Eznos');
		}
		// create a new zone
		else if (!!zone && waterZone && building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'Eznos');
		}
		// create a new water zone and building
		else if (zone && !!waterZone && !!building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'Eznos');
		}
		// create a new water zone
		else if (zone && !!waterZone && building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'Eznos');
		}
		// create a new building
		else if (zone && waterZone && !!building) {
			return Response(res, SUCCESS_STATUS, OK_CODE, 'Eznos');
		}
		// create all
		else if (!!zone && !!waterZone && !!building) {
			await zones.create({
				name: data.zoneName,
			});
			const zone = await zones.findOne({
				where: {
					name: data.zoneName,
				},
			});
			if (zone) {
				await waterZones.create({ name: data.waterZoneName });
				await waterZones.update({ zoneId: zone.id }, { where: { name: data.waterZoneName } });
				const waterZone = await waterZones.findOne({ name: data.waterZoneName });
				await buildings.create({ name: data.buildingName, lat: data.lat, lng: data.lng });
				await buildings.update({ zoneId: zone.id }, { where: { name: data.buildingName } });
				await buildings.update({ waterZoneId: waterZone.id }, { where: { name: data.buildingName } });
				return Response(res, SUCCESS_STATUS, OK_CODE, 'ez');
			}
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

module.exports.Building = building;
module.exports.CreateRoom = createRoom;
module.exports.DeleteRoom = deleteRoom;
module.exports.UpdateRoom = updateRoom;
module.exports.CreateZone = createZone;
