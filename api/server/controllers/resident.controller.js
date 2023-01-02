const bcrypt = require('bcrypt');
const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, OK_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { users, accommodations, rooms, zones, waterZones, buildings } = require('../repositories/models');
const TokenList = require('./auth.controller');
const nodemailer = require('nodemailer');
// * not fin
const residentsList = async (req, res) => {
	// const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		// if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
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
		if (resident) {
			return Response(res, SUCCESS_STATUS, OK_CODE, resident);
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
		// } else {
		// 	return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		// }
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

const editResident = async (req, res) => {
	const id = await req.query.id;
	// const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const {
		rank,
		firstName,
		lastName,
		zoneId,
		waterZoneId,
		buildingId,
		roomNo,
		electricityNo,
		electricityMeterNo,
		waterNo,
		waterMeterNo,
		status,
	} = req.body;
	const data = {
		rank,
		firstName,
		lastName,
		zoneId,
		waterZoneId,
		buildingId,
		roomNo,
		electricityNo,
		electricityMeterNo,
		waterNo,
		waterMeterNo,
		status,
	};
	const user = await users.findOne({
		where: {
			id: id,
		},
	});
	if (user) {
		await rooms.update({ zoneId: data.zoneId }, { where: { id: id } });
		await rooms.update({ waterZoneId: data.waterZoneId }, { where: { id: id } });
		await rooms.update({ buildingId: data.buildingId }, { where: { id: id } });
		await rooms.update({ roomNo: data.roomNo }, { where: { id: id } });
		await rooms.update({ electricityNo: data.electricityNo }, { where: { id: id } });
		await rooms.update({ electricityMeterNo: data.electricityMeterNo }, { where: { id: id } });
		await rooms.update({ waterNo: data.waterNo }, { where: { id: id } });
		await rooms.update({ waterMeterNo: data.waterMeterNo }, { where: { id: id } });
		await rooms.update({ roomType: data.roomType }, { where: { id: id } });
		await rooms.update({ status: data.status }, { where: { id: id } });
		return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
	}
	// const accommodation = await accommodations.findOne({ where: { userId: id } });
	// if (accommodation && room) {
	// 	await rooms.update({ status: status }, { where: { id: accommodation.roomId } });
	// 	await accommodations.update({ roomId: room.id }, { where: { userId: id } });
	// }
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

module.exports.ResidentsList = residentsList;
module.exports.CreateResident = createResident;
module.exports.DeleteResident = deleteResident;
module.exports.EditResident = editResident;
module.exports.SendMail = sendMail;
