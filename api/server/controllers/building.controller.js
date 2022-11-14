const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { rooms, zones, buildings, waterZones } = require('../repositories/models');
const TokenList = require('./auth.controller');

const building = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const roomsDetail = await rooms.findAll({
				include: [
					{
						model: zones,
						attributes: ['id', 'name'],
					},
					{
						model: waterZones,
						attributes: ['id', 'name'],
					},
					{
						model: buildings,
						attributes: ['id', 'name'],
					},
				],
				attributes: ['id', 'building_id', 'roomNo', 'roomType', 'waterNo', 'waterMeterNo', 'status'],
			});
			if (!roomsDetail) {
				return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
			} else {
				res.status(200).json({ status: 'success', status_code: 200, result: roomsDetail });
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (error) {
		console.log(error);
	}
};

const createRoom = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		const {
			zoneId,
			waterZoneId,
			buildingId,
			roomNo,
			electricityNo,
			electricityMeterNo,
			waterNo,
			waterMeterNo,
			roomType,
			status,
		} = req.body;
		const data = {
			zoneId,
			waterZoneId,
			buildingId,
			roomNo,
			electricityNo,
			electricityMeterNo,
			waterNo,
			waterMeterNo,
			roomType,
			status,
		};
		const findZone = await zones.findOne({
			where: {
				id: zoneId,
			},
		});
		const findWaterZone = await waterZones.findOne({
			where: {
				id: waterZoneId,
			},
		});
		const findbuilding = await buildings.findOne({
			where: {
				id: buildingId,
			},
		});
		if (!findZone && findWaterZone && findbuilding) {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
		if (findZone && !findWaterZone && findbuilding) {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
		if (findZone && findWaterZone && !findbuilding) {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
		if (findZone && findWaterZone && findbuilding) {
			console.log(getRefreshTokenFromHeader in TokenList.TokenList);
			if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
				const newRoom = await rooms.create(data);
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
	const id = await req.params.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const room = await rooms.findOne({
				where: {
					id: id,
				},
			});
			if (room) {
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
	const {
		zoneId,
		waterZoneId,
		buildingId,
		roomNo,
		electricityNo,
		electricityMeterNo,
		waterNo,
		waterMeterNo,
		roomType,
		status,
	} = await req.body;
	try {
		const room = await rooms.findOne({
			while: {
				id: id,
			},
		});
		if (room) {
			if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
				await rooms.update({ zoneId: zoneId }, { where: { id: id } });
				await rooms.update({ waterZoneId: waterZoneId }, { where: { id: id } });
				await rooms.update({ buildingId: buildingId }, { where: { id: id } });
				await rooms.update({ roomNo: roomNo }, { where: { id: id } });
				await rooms.update({ electricityNo: electricityNo }, { where: { id: id } });
				await rooms.update({ electricityMeterNo: electricityMeterNo }, { where: { id: id } });
				await rooms.update({ waterNo: waterNo }, { where: { id: id } });
				await rooms.update({ waterMeterNo: waterMeterNo }, { where: { id: id } });
				await rooms.update({ roomType: roomType }, { where: { id: id } });
				await rooms.update({ status: status }, { where: { id: id } });
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

module.exports.Building = building;
module.exports.CreateRoom = createRoom;
module.exports.DeleteRoom = deleteRoom;
module.exports.UpdateRoom = updateRoom;
