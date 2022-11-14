const bcrypt = require('bcrypt');
const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, OK_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { users, accommodations, rooms } = require('../repositories/models');
const TokenList = require('./auth.controller');

// * not fin
const residentsList = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const resident = await users.findAll({
				attributes: ['firstName', 'lastName'],
				where: {
					deleted: 'false',
				},
			});
			if (resident) {
				return Response(res, SUCCESS_STATUS, OK_CODE, { resident });
			} else {
				return Response(res, SUCCESS_STATUS, OK_CODE, { resident });
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const createResident = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const randomText = Math.random().toString(36).substring(2, 7);
	try {
		const { rank, firstName, lastName, zoneId, waterZoneId, buildingId, roomNo } = req.body;
		const data = {
			username: randomText,
			password: randomText,
			rank,
			firstName,
			lastName,
			role: 'user',
			deleted: false,
		};
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const room = await rooms.findOne({
				where: {
					zoneId: zoneId,
					waterZoneId: waterZoneId,
					buildingId: buildingId,
					roomNo: roomNo,
				},
			});
			const oldUser = await users.findOne({
				where: { firstName: firstName, lastName: lastName },
			});
			if (room && !oldUser) {
				data.password = await bcrypt.hash(data.password, 10);
				const newuser = await users.create(data);
				if (newuser) {
					const user = await users.findOne({
						where: { firstName: firstName },
					});
					if (user) {
						await accommodations.create({ roomId: room.id, userId: user.id, host: true, deleted: false });
						await rooms.update({ status: 'not_empty' }, { where: { id: room.id } });
						return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
					} else {
						return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
					}
				}
			}
			if (room && oldUser) {
				await accommodations.create({ roomId: room.id, userId: oldUser.id, host: true, deleted: false });
				await rooms.update({ status: 'not_empty' }, { where: { id: room.id } });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			} else {
				return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const deleteResident = async (req, res) => {
	// user id
	const id = await req.query.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const roomId = await accommodations.findOne({ where: { userId: id } });
	if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
		if (roomId) {
			const room = await rooms.findOne({ where: { id: roomId.roomId } });
			await rooms.update({ status: 'empty' }, { where: { id: room.id } });
			await accommodations.update({ host: false }, { where: { userId: id } });
			await accommodations.update({ deleted: true }, { where: { userId: id } });
			await users.update({ deleted: true }, { where: { id: id } });
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		}
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	} else {
		return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
	}
};

// const editResident = async (req, res) => {
// 	const id = await req.query.id;
// 	// const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
// 	const {
// 		rank,
// 		firstName,
// 		lastName,
// 		zoneId,
// 		waterZoneId,
// 		buildingId,
// 		roomNo,
// 		electricityNo,
// 		electricityMeterNo,
// 		waterNo,
// 		waterMeterNo,
// 		status,
// 	} = req.body;
// 	const data = {
// 		rank,
// 		firstName,
// 		lastName,
// 		zoneId,
// 		waterZoneId,
// 		buildingId,
// 		roomNo,
// 		electricityNo,
// 		electricityMeterNo,
// 		waterNo,
// 		waterMeterNo,
// 		status,
// 	};
// 	const room = await rooms.findOne({
// 		where: {
// 			zoneId: zoneId,
// 			waterZoneId: waterZoneId,
// 			buildingId: buildingId,
// 			roomNo: roomNo,
// 		},
// 	});
// 	const accommodation = await accommodations.findOne({ where: { userId: id } });
// 	if (accommodation && room) {
// 		await rooms.update({ status: status }, { where: { id: accommodation.roomId } });
// 		await accommodations.update({ roomId: room.id }, { where: { userId: id } });
// 	}
// };

module.exports.ResidentsList = residentsList;
module.exports.CreateResident = createResident;
module.exports.DeleteResident = deleteResident;
// module.exports.EditResident = editResident;
