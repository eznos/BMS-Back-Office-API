const bcrypt = require('bcrypt');
const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, OK_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const {
	SOMETHING_WENT_WRONG,
	INVALID_REFRESH_TOKEN,
	INVALID_ROOM_NO,
} = require('../../constants/error-message.constant');
const { users, accommodations, rooms, zones, waterZones, buildings, billings } = require('../repositories/models');
const TokenList = require('./auth.controller');
const nodemailer = require('nodemailer');
const xl = require('excel4node');

var fs = require('fs');
const residentsList = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		const resident = await users.findAll({
			include: [
				{
					model: accommodations,
					attributes: ['id', 'host'],
					where: {
						deleted: 'false',
					},
					include: [
						{
							model: rooms,
							attributes: [
								'id',
								'zoneId',
								'waterZoneId',
								'buildingId',
								'roomNo',
								'roomType',
								'electricityNo',
								'electricityMeterNo',
								'waterNo',
								'waterMeterNo',
								'status',
							],
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
						},
					],
				},
			],
			attributes: ['id', 'rank', 'firstName', 'lastName'],
		});
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			if (resident) {
				return Response(res, SUCCESS_STATUS, OK_CODE, resident);
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
			const oldUser = await users.findOne({ where: { firstName: firstName, lastName: lastName } });
			if (room && !oldUser) {
				data.password = await bcrypt.hash(data.password, 10);
				const newuser = await users.create(data);
				if (newuser) {
					const user = await users.findOne({
						where: { firstName: firstName },
					});
					if (user) {
						let accommodation = await accommodations.create({
							roomId: room.id,
							userId: user.id,
							host: true,
							deleted: false,
						});
						await rooms.update({ status: 'not_empty' }, { where: { id: room.id } });
						await billings.create({
							billingType: 'water',
							accommodationId: accommodation.id,
							status: 'draft',
							unit: 0,
							price: 0,
							priceDiff: 0,
							totalPay: 0,
						});
						return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
					} else {
						return HandlerError(res, CustomError(INVALID_ROOM_NO));
					}
				}
			}
			if (room && oldUser) {
				let accommodation = await accommodations.create({
					roomId: room.id,
					userId: oldUser.id,
					host: true,
					deleted: false,
				});
				await rooms.update({ status: 'not_empty' }, { where: { id: room.id } });
				await billings.create({
					billingType: 'water',
					accommodationId: accommodation.id,
					status: 'draft',
					unit: 0,
					price: 0,
					priceDiff: 0,
					totalPay: 0,
				});
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			} else {
				return HandlerError(res, CustomError(INVALID_ROOM_NO));
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

const editResident = async (req, res) => {
	const id = await req.query.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const { rank, firstName, lastName, zoneId, waterZoneId, buildingId, roomNo } = req.body;
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const data = { rank, firstName, lastName, zoneId, waterZoneId, buildingId, roomNo };
			const user = await users.findOne({ where: { id: id } });
			const room = await rooms.findOne({
				where: { zoneId: zoneId, waterZoneId: waterZoneId, buildingId: buildingId, roomNo: roomNo },
			});
			const accommodation = await accommodations.findOne({ where: { user_id: id } });
			if (user && room) {
				await users.update({ rank: data.rank }, { where: { id: id } });
				await users.update({ firstName: data.firstName }, { where: { id: id } });
				await users.update({ lastName: data.lastName }, { where: { id: id } });
				await rooms.update({ status: 'not_empty' }, { where: { id: room.id } });
				await accommodations.update({ roomId: room.id }, { where: { id: accommodation.id, deleted: false } });
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
const exportResidents = async (req, res) => {
	const id = req.body.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const wb = new xl.Workbook();
	const resident = await users.findAll({
		include: [
			{
				model: accommodations,
				attributes: ['id', 'host'],
				where: {
					userId: id,
					deleted: 'false',
				},
				include: [
					{
						model: rooms,
						attributes: [
							'id',
							'zoneId',
							'waterZoneId',
							'buildingId',
							'roomNo',
							'roomType',
							'waterNo',
							'waterMeterNo',
							'status',
						],
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
					},
				],
			},
		],
		attributes: ['id', 'rank', 'firstName', 'lastName'],
	});
	if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
		if (resident) {
			const ws = wb.addWorksheet('Data');
			// header satart
			const headerRows = 3;
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
				.string('id')
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
				.string('ยศ')
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
				.string('ชื่อ')
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
				.string('นามสกุล')
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
			ws.cell(headerRows, 7)
				.string('สายของมิเตอร์')
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
			ws.cell(headerRows, 9)
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
			ws.cell(headerRows, 10)
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
			ws.cell(headerRows, 11)
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
			ws.cell(headerRows, 12)
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
			ws.cell(4, 14)
				.string('single = ห้องโสด')
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
			ws.cell(5, 14)
				.string('family_1 = ห้องครอบครัว 1')
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
			ws.cell(6, 14)
				.string('family_2 = ห้องครอบครัว 2')
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

			// end header
			// start data
			await delay(500);
			const startRow = 4;
			if (resident.length) {
				resident.forEach((item, i) => {
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
						.string(item.id)
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
						.string(item.rank)
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
						.string(item.firstName)
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
						.string(item.lastName)
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
						.string(item.accommodations[0].room.zone.name)
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
						.string(item.accommodations[0].room.waterZone.name)
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
						.string(item.accommodations[0].room.building.name)
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
						.string(item.accommodations[0].room.roomNo)
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
					ws.cell(currentRow, 10)
						.string(item.accommodations[0].room.waterNo)
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
					ws.cell(currentRow, 11)
						.string(item.accommodations[0].room.waterMeterNo)
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
					ws.cell(currentRow, 12)
						.string(item.accommodations[0].room.roomType)
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
			await wb.write('Resident-Data-Export.xlsx');
			await delay(2000);
			await res.download(
				'/home/eznos/Desktop/BMS-Back-Office-API/Resident-Data-Export.xlsx',
				'Resident-Data-Export.xlsx',
				function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log('GGG');
					}
				}
			);
			await delay(3000);
			var filePath = '/home/eznos/Desktop/BMS-Back-Office-API/Resident-Data-Export.xlsx';
			fs.unlinkSync(filePath);
		}
	} else {
		return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
	}
};

const sendMail = async (req, res) => {
	const email = req.body.email;
	const transporter = nodemailer.createTransport({
		service: 'hotmail',
		auth: {
			user: process.env.EZNOS_MAIL, // your email
			pass: process.env.EZNOS_PASSWORD, // your password
		},
	});
	// setup email data with unicode symbols
	const mailOptions = {
		from: 'Eznos', // sender
		to: email, // list of receivers
		subject: 'ทดสอบการส่งอีเมลโดย', // Mail subject
		html:
			'<!DOCTYPE html>' +
			'<html><head><title>Appointment</title>' +
			'</head><body><div>' +
			'<img src="https://www.techhub.in.th/wp-content/uploads/2021/05/118283916_b19c5a1f-162b-410b-8169-f58f0d153752.jpg" alt="" width="160">' +
			'<p>Thank you for your appointment.</p>' +
			'<p>Here is summery:</p>' +
			'<p>Name: James Falcon</p>' +
			'<p>Date: Feb 2, 2017</p>' +
			'<p>Package: Hair Cut </p>' +
			'<p>Arrival time: 4:30 PM</p>' +
			'</div></body></html>',
	};
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function (err, info) {
		if (err) console.log(err);
		else console.log(info);
		return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
	});
};

const residentNames = async (req, res) => {
	const firstName = await users.findAll({ where: { deleted: false }, attributes: ['firstName'] });
	const lastName = await users.findAll({ attributes: ['lastName'] });
	return Response(res, SUCCESS_STATUS, OK_CODE, { firstName, lastName });
};

module.exports.ResidentsList = residentsList;
module.exports.CreateResident = createResident;
module.exports.DeleteResident = deleteResident;
module.exports.EditResident = editResident;
module.exports.SendMail = sendMail;
module.exports.ExportResidents = exportResidents;
module.exports.ResidentNames = residentNames;
