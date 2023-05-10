const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, UNAUTHORIZED_CODE, OK_CODE } = require('../../constants/http-status-code.constant');
const {
	SOMETHING_WENT_WRONG,
	INVALID_REFRESH_TOKEN,
	WATER_ZONE_ALREADY_EXISTS,
} = require('../../constants/error-message.constant');
const { rooms, zones, buildings, waterZones, accommodations } = require('../repositories/models');
const { UpdateRoomScheme, UpdateRoomDTO } = require('../domains/building.domain');
const TokenList = require('./auth.controller');
const xl = require('excel4node');
const wb = new xl.Workbook();

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

const exportBuildings = async (req, res) => {
	const id = req.body.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const room = await rooms.findAll({
				where: {
					id: id,
				},
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
			if (room) {
				const ws = wb.addWorksheet('Data');
				const headerRows = 3;
				ws.cell(1, 1)
					.string('ตารางสถานะห้องพัก')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 1)
					.string('ลำดับ')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 2)
					.string('สายมิเตอร์')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 3)
					.string('พื้นที่')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 4)
					.string('อาคาร')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 5)
					.string('เลขห้องพัก')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 6)
					.string('เลขผู้ใช้น้ำ')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 7)
					.string('เลขมิเตอร์น้ำ')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 8)
					.string('ประเภทห้องพัก')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(headerRows, 9)
					.string('สถานะ')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});

				ws.cell(4, 13)
					.string('not_empty = ห้องไม่ว่าง')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				ws.cell(5, 13)
					.string('empty = ห้องว่าง')
					.style({
						alignment: {
							vertical: ['center'],
							horizontal: ['left'],
						},
						font: {
							color: '000000',
							size: 12,
						},
						border: {
							bottom: {
								style: 'thin',
								color: '000000',
							},
							right: {
								style: 'thin',
								color: '000000',
							},
							left: {
								style: 'thin',
								color: '000000',
							},
							top: {
								style: 'thin',
								color: '000000',
							},
						},
					});
				await delay(500);
				const startRow = 4;
				if (room.length) {
					room.forEach((item, i) => {
						const currentRow = i + startRow;
						ws.cell(currentRow, 1)
							.number(i + 1)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 2)
							.string(item.waterZone.name)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 3)
							.string(item.zone.name)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 4)
							.string(item.building.name)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 5)
							.string(item.roomNo)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 6)
							.string(item.waterNo)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 7)
							.string(item.waterMeterNo)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 8)
							.string(item.roomType)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
						ws.cell(currentRow, 9)
							.string(item.status)
							.style({
								alignment: {
									vertical: ['center'],
									horizontal: ['left'],
								},
								font: {
									color: '000000',
									size: 12,
								},
								border: {
									bottom: {
										style: 'thin',
										color: '000000',
									},
									right: {
										style: 'thin',
										color: '000000',
									},
									left: {
										style: 'thin',
										color: '000000',
									},
									top: {
										style: 'thin',
										color: '000000',
									},
								},
							});
					});
				}
				// end data
				await delay(550);
				wb.write(`FileName.xlsx`, res);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const getZonesData = async (req, res) => {
	const zone = await zones.findAll({ attributes: ['id', 'name'] });
	return Response(res, SUCCESS_STATUS, OK_CODE, zone);
};

const getWaterZonesData = async (req, res) => {
	const idZone = req.query.id;
	try {
		if (idZone) {
			const waterZone = await waterZones.findAll({ where: { zoneId: idZone } }, { attributes: ['id', 'name'] });
			return Response(res, SUCCESS_STATUS, OK_CODE, waterZone);
		} else {
			const waterZone = await waterZones.findAll({ attributes: ['id', 'name'] });
			return Response(res, SUCCESS_STATUS, OK_CODE, waterZone);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const getBuildingsData = async (req, res) => {
	const idWater = req.query.id;
	try {
		if (idWater) {
			let building = await buildings.findAll({ where: { waterZoneId: idWater } }, { attributes: ['id', 'name'] });
			return Response(res, SUCCESS_STATUS, OK_CODE, building);
		} else {
			let building = await buildings.findAll({ attributes: ['id', 'name'] });
			return Response(res, SUCCESS_STATUS, OK_CODE, building);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const getRoomsData = async (req, res) => {
	const idBuilding = req.query.id;
	try {
		if (idBuilding) {
			const room = await rooms.findAll(
				{ where: { buildingId: idBuilding, status: 'empty' } },
				{ attributes: ['roomNo'] }
			);
			return Response(res, SUCCESS_STATUS, OK_CODE, room);
		} else {
			const room = await rooms.findAll({ where: { status: 'empty' } }, { attributes: ['roomNo'] });
			return Response(res, SUCCESS_STATUS, OK_CODE, room);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const getNotEmptyRoomsData = async (req, res) => {
	const idBuilding = req.query.id;
	try {
		if (idBuilding) {
			const room = await rooms.findAll(
				{ where: { buildingId: idBuilding, status: 'not_empty' } },
				{ attributes: ['roomNo'] }
			);
			return Response(res, SUCCESS_STATUS, OK_CODE, room);
		} else {
			const room = await rooms.findAll({ where: { status: 'not_empty' } }, { attributes: ['roomNo'] });
			return Response(res, SUCCESS_STATUS, OK_CODE, room);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const createZone = async (req, res) => {
	const name = await req.body.name;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		// create all
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const zone = await zones.findOne({ where: { name: name } });
			if (zone) {
				res.status(422).json({ error_message: 'Unprocessable Entity' });
			} else {
				await zones.create({ name: name });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const createWaterZone = async (req, res) => {
	const zoneId = req.body.zoneId;
	const name = req.body.name;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		// create all
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const waterZone = await waterZones.findOne({ where: { name: name } });
			const zone = await zones.findOne({ where: { id: zoneId } });

			if (waterZone && !zone) {
				console.log(1);
				return HandlerError(res, CustomError(WATER_ZONE_ALREADY_EXISTS));
			} else {
				await waterZones.create({ zoneId: zoneId, name: name });
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const createBuilding = async (req, res) => {
	const zoneId = req.body.zoneId;
	const waterZoneId = req.body.waterZoneId;
	const name = await req.body.name;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		// create all
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const building = await buildings.findOne({ where: { name: name } });
			const zone = await zones.findOne({ where: { id: zoneId } });
			const waterZone = await waterZones.findOne({ where: { id: waterZoneId } });
			if (building || !zone || !waterZone) {
				return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
			} else {
				await buildings.create({
					zoneId: zoneId,
					waterZoneId: waterZoneId,
					name: name,
				});
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

module.exports.Building = building;
module.exports.CreateRoom = createRoom;
module.exports.DeleteRoom = deleteRoom;
module.exports.UpdateRoom = updateRoom;
module.exports.ExportBuildings = exportBuildings;
module.exports.GetZonesData = getZonesData;
module.exports.GetWaterZonesData = getWaterZonesData;
module.exports.GetBuildingsData = getBuildingsData;
module.exports.GetRoomsData = getRoomsData;
module.exports.CreateZone = createZone;
module.exports.CreateWaterZone = createWaterZone;
module.exports.CreateBuilding = createBuilding;
module.exports.GetNotEmptyRoomsData = getNotEmptyRoomsData;
