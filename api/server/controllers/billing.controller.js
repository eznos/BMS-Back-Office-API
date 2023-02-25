const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, OK_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { users, accommodations, billings, rooms, zones, waterZones, buildings } = require('../repositories/models');
const TokenList = require('./auth.controller');
const { Op } = require('sequelize');
const xl = require('excel4node');
const wb = new xl.Workbook();
const water = async (req, res) => {
	var now = new Date();
	var startDate = new Date(now.getFullYear() + 0, 1, 1);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		const billing = await users.findAll({
			include: [
				{
					model: accommodations,
					attributes: ['id', 'host'],
					where: {
						deleted: 'false',
					},
					include: [
						{
							model: billings,
							attributes: [
								'id',
								'billing_type',
								'status',
								'unit',
								'price',
								'price_diff',
								'total_pay',
								'created_at',
								'updated_at',
							],
							where: {
								billing_type: 'water',
								updated_at: { [Op.between]: [startDate, endDate] },
							},
						},
						{
							model: rooms,
							attributes: [
								'id',
								'building_id',
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
			attributes: ['id', 'rank', 'affiliation', 'firstName', 'lastName'],
		});
		if (!billing) {
			res.status(500);
		}
		if (!getRefreshTokenFromHeader && !(getRefreshTokenFromHeader in TokenList.TokenList)) {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
		if (billing && getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			return Response(res, SUCCESS_STATUS, OK_CODE, { billing });
		} else {
			return Response(res, SUCCESS_STATUS, OK_CODE, {});
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const updateWater = async (req, res) => {
	const id = req.query.id;
	var now = new Date();
	var startDate = new Date(now.getFullYear() + 0, 1, 1);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const { unit, price, status, billing_cycle } = req.body;
	const accommodation = await accommodations.findOne({ where: { user_id: id, host: true, deleted: false } });
	const billing = await billings.findOne({
		where: {
			accommodation_id: accommodation.id,
			billingType: 'water',
			updated_at: { [Op.between]: [startDate, endDate] },
		},
	});
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			if (billing) {
				const updateUnit = await billings.update({ unit: unit }, { where: { id: billing.id } });
				const updatePrice = await billings.update({ price: price }, { where: { id: billing.id } });
				const updateStatus = await billings.update({ status: status }, { where: { id: billing.id } });
				const updatebillCycle = await billings.update(
					{ updatedAt: billing_cycle },
					{ where: { id: billing.id } }
				);
				if (updateUnit && updatePrice && updateStatus && updatebillCycle) {
					return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
				} else {
					return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
				}
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

const createWaterBill = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const user = await users.findAll({ where: { deleted: false } });
			const userIds = [];
			for (let i = 0; i < user.length; i++) {
				userIds.push(user[i].id);
			}
			const room = await rooms.findAll({ where: { status: 'not_empty' } });
			const roomIds = [];
			for (let i = 0; i < room.length; i++) {
				roomIds.push(room[i].id);
			}
			let accommodation = await accommodations.findAll({
				where: { roomId: roomIds, userId: userIds, host: true, deleted: false },
			});
			for (let i = 0; i < accommodation.length; i++) {
				await billings.create({
					billingType: 'water',
					accommodationId: accommodation[i].id,
					status: 'draft',
					unit: 0,
					price: 0,
					priceDiff: 0,
					totalPay: 0,
				});
			}
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const electric = async (req, res) => {
	const date = req.query.date;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		const billing = await users.findAll({
			include: [
				{
					model: accommodations,
					attributes: ['id', 'host'],
					where: {
						deleted: 'false',
					},
					include: [
						{
							model: billings,
							attributes: ['id', 'billing_type', 'status', 'unit', 'price', 'total_pay', 'updated_at'],
							where: {
								billing_type: 'electricity',
								updated_at: date,
							},
						},
						{
							model: rooms,
							attributes: [
								'id',
								'building_id',
								'roomNo',
								'roomType',
								'electricityNo',
								'electricityMeterNo',
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
			attributes: ['id', 'rank', 'affiliation', 'firstName', 'lastName'],
		});
		if (!billing) {
			res.status(500);
		}
		if (!getRefreshTokenFromHeader && !(getRefreshTokenFromHeader in TokenList.TokenList)) {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
		if (date && billing && getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			return Response(res, SUCCESS_STATUS, OK_CODE, { billing });
		} else {
			return Response(res, SUCCESS_STATUS, OK_CODE, {});
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const updeteEletric = async (req, res) => {
	const id = req.query.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const { unit, price, status } = req.body;
	const billing = await billings.findOne({ where: { id: id, billingType: 'electricity' } });
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			if (billing) {
				const updateUnit = await billings.update({ unit: unit }, { where: { id: id } });
				const updatePrice = await billings.update({ price: price }, { where: { id: id } });
				const updateStatus = await billings.update({ status: status }, { where: { id: id } });
				if (updateUnit && updatePrice && updateStatus) {
					return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
				} else {
					return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
				}
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

const history = async (req, res) => {
	const firstName = req.query.firstName;
	const lastName = req.query.lastName;
	const rank = req.query.rank;
	try {
		const electric = await users.findOne({
			include: [
				{
					model: accommodations,
					attributes: ['host'],
					where: {
						deleted: 'false',
					},
					include: [
						{
							model: billings,
							attributes: ['billing_type', 'unit', 'price', 'price_diff', 'total_pay', 'updated_at'],
							where: {
								billing_type: 'electricity',
							},
						},
					],
				},
			],
			where: {
				rank: rank,
				firstName: firstName,
				lastName: lastName,
			},
			attributes: ['id'],
		});
		const waterbill = await users.findOne({
			include: [
				{
					model: accommodations,
					attributes: ['host'],
					where: {
						deleted: 'false',
					},
					include: [
						{
							model: billings,
							attributes: ['billing_type', 'unit', 'price', 'price_diff', 'total_pay', 'updated_at'],
							where: {
								billing_type: 'water',
							},
						},
					],
				},
			],
			where: {
				rank: rank,
				firstName: firstName,
				lastName: lastName,
			},
			attributes: ['id'],
		});
		if (rank && firstName && lastName) {
			return Response(res, SUCCESS_STATUS, OK_CODE, { electric: electric, water: waterbill });
		}
		if (!electric && !waterbill) {
			res.status(200).json({ status: 'success no data', status_code: 200 });
		} else {
			res.status(401).json({ status: 'unauthorized', error_message: 'unauthorized', status_code: 401 });
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const differencePrice = async (req, res) => {
	const id = req.query.id;
	const priceZone = req.body.price;
	var now = new Date();
	var startDate = new Date(now.getFullYear() + 0, 1, 1);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	try {
		if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
			const waterZone = await waterZones.findAll({ where: { id: id } });
			if (waterZone) {
				const room = await rooms.findAll({ where: { waterZoneId: id, status: 'not_empty' } });
				if (room) {
					const roomIds = [];
					for (let i = 0; i < room.length; i++) {
						roomIds.push(room[i].id);
					}
					const accommodation = await accommodations.findAll({ where: { roomId: roomIds } });
					const accommodationIds = [];
					for (let i = 0; i < accommodation.length; i++) {
						accommodationIds.push(accommodation[i].id);
					}
					if (accommodation) {
						// find all bills in this month
						const bills = await billings.findAll({
							where: {
								accommodationId: accommodationIds,
								billingType: 'water',
								updated_at: { [Op.between]: [startDate, endDate] },
							},
							attributes: { id },
						});
						const numberOfBills = bills.length;
						// find billing id form each bill
						const billIds = [];
						for (let i = 0; i < numberOfBills; i++) {
							billIds.push(bills[i].id);
						}
						// find accommodation id form each accommodation
						const accomIds = [];
						for (let i = 0; i < numberOfBills; i++) {
							accomIds.push(bills[i].accommodationId);
						}
						// find sum of water price in water zone
						await billings.update({ totalPay: 0 }, { where: { id: billIds } });
						var sumOfBills = await billings.sum('price', {
							where: { accommodationId: accomIds, updated_at: { [Op.between]: [startDate, endDate] } },
						});
						// find diff price
						const diffPrice = Math.floor((priceZone - sumOfBills) / numberOfBills) >> 0;
						// update and increment diff price total price
						for (let i = 0; i < bills.length; i++) {
							await billings.update(
								{ priceDiff: diffPrice },
								{ where: { id: bills[i].id, updated_at: { [Op.between]: [startDate, endDate] } } }
							);
							await billings.update(
								{ status: 'calculated' },
								{ where: { id: bills[i].id, updated_at: { [Op.between]: [startDate, endDate] } } }
							);
							await billings.increment(
								{ totalPay: bills[i].price },
								{ where: { id: bills[i].id, updated_at: { [Op.between]: [startDate, endDate] } } }
							);
							await billings.increment(
								{ totalPay: diffPrice },
								{ where: { id: bills[i].id, updated_at: { [Op.between]: [startDate, endDate] } } }
							);
						}
						return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
					} else {
						return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
					}
				} else {
					return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
				}
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

const exportWaterBills = async (req, res) => {
	const id = req.body.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	var now = new Date();
	var startDate = new Date(now.getFullYear() + 0, 1, 1);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const user = await accommodations.findAll({ where: { userId: id, host: true, deleted: false } });
	const accommodationsIds = [];
	for (let i = 0; i < user.length; i++) {
		accommodationsIds.push(user[i].id);
	}
	const bills = await billings.findAll({
		where: { accommodationId: accommodationsIds, updatedAt: { [Op.between]: [startDate, endDate] } },
	});
	if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
		if (bills) {
			await billings.update(
				{ status: 'exported' },
				{ where: { accommodationId: accommodationsIds, updatedAt: { [Op.between]: [startDate, endDate] } } }
			);
			const dataToExport = await users.findAll({
				where: { id: id, deleted: false },
				include: [
					{
						model: accommodations,
						attributes: ['id', 'host'],
						where: { userId: id, host: true, deleted: false },
						include: [
							{
								model: billings,
								attributes: [
									'id',
									'billing_type',
									'status',
									'unit',
									'price',
									'priceDiff',
									'totalPay',
									'createdAt',
									'updatedAt',
								],
								where: {
									billing_type: 'water',
									updated_at: { [Op.between]: [startDate, endDate] },
								},
							},
							{
								model: rooms,
								attributes: [
									'id',
									'building_id',
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
				attributes: ['id', 'rank', 'affiliation', 'firstName', 'lastName'],
			});

			const ws = wb.addWorksheet('Data', {
				disableRowSpansOptimization: true,
			});
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
				.string('สังกัด')
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
			ws.cell(headerRows, 6)
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
			ws.cell(headerRows, 7)
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
			ws.cell(headerRows, 8)
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
			ws.cell(headerRows, 9)
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
			ws.cell(headerRows, 10)
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
			ws.cell(headerRows, 11)
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
			ws.cell(headerRows, 12)
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
			ws.cell(headerRows, 13)
				.string('รอบบิล')
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
			ws.cell(headerRows, 14)
				.string('จำนวนหน่วย')
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
			ws.cell(headerRows, 15)
				.string('ค่าน้ำ')
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
			ws.cell(headerRows, 16)
				.string('ค่าน้ำส่วนต่าง')
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
			ws.cell(headerRows, 17)
				.string('ค่าน้ำรวม')
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
			ws.cell(headerRows, 18)
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
			// end header
			// start data
			const startRow = 4;
			if (dataToExport.length) {
				dataToExport.forEach((item, i) => {
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
						.string(item.affiliation)
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
					ws.cell(currentRow, 6)
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
					ws.cell(currentRow, 7)
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
					ws.cell(currentRow, 8)
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
					ws.cell(currentRow, 9)
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
					ws.cell(currentRow, 10)
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
					ws.cell(currentRow, 11)
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
					ws.cell(currentRow, 12)
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
					ws.cell(currentRow, 13)
						.date(item.accommodations[0].billings[0].createdAt)
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
					ws.cell(currentRow, 14)
						.number(item.accommodations[0].billings[0].unit)
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
					ws.cell(currentRow, 15)
						.number(item.accommodations[0].billings[0].price)
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
					ws.cell(currentRow, 16)
						.number(item.accommodations[0].billings[0].priceDiff)
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
					ws.cell(currentRow, 17)
						.number(item.accommodations[0].billings[0].totalPay)
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
					ws.cell(currentRow, 18)
						.string(item.accommodations[0].billings[0].status)
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
			await wb.write('Water-Bills-Data-Export.xlsx');
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
	} else {
		return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
	}
};

module.exports.Water = water;
module.exports.UpdateWater = updateWater;
module.exports.CreateWaterBill = createWaterBill;
module.exports.Electric = electric;
module.exports.UpdeteEletric = updeteEletric;
module.exports.History = history;
module.exports.DifferencePrice = differencePrice;
module.exports.ExportWaterBills = exportWaterBills;
module.exports.Wb = wb;
