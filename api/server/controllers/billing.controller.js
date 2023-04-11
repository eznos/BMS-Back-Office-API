const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, OK_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { users, accommodations, billings, rooms, zones, waterZones, buildings } = require('../repositories/models');
const TokenList = require('./auth.controller');
const { Op } = require('sequelize');
const xl = require('excel4node');
var fs = require('fs');
const water = async (req, res) => {
	var date = req.query.date;
	var now = new Date(date);
	var startDate = new Date(now.getFullYear(), now.getMonth() + 0, +2, 1);
	console.log(startDate);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	console.log(endDate);
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
								created_at: { [Op.between]: [startDate, endDate] },
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
	const { unit, unitPrice, billing_cycle } = req.body;
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
				const price = Math.floor(unitPrice * unit);
				const updateUnit = await billings.update({ unit: unit }, { where: { id: billing.id } });
				const updatePrice = await billings.update({ price: price }, { where: { id: billing.id } });
				const updateStatus = await billings.update({ status: 'in_progress' }, { where: { id: billing.id } });
				const updatebillCycle = await billings.update(
					{ updatedAt: billing_cycle },
					{ where: { id: billing.id } }
				);
				await billings.update({ totalPay: price }, { where: { id: billing.id } });
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

const createOldWaterBill = async (req, res) => {
	const { rank, firstName, lastName, zone, waterZone, building, roomNo, date, unit, price, priceDiff, totalPay } =
		req.body;
	try {
		const user = await users.findOne({ where: { rank: rank, firstName: firstName, lastName: lastName } });
		const room = await rooms.findOne({
			where: { zoneId: zone, waterZoneId: waterZone, buildingId: building, roomNo: roomNo },
		});
		const accommodation = await accommodations.findOne({
			where: { roomId: room.id, userId: user.id, host: true, deleted: false },
		});
		if (user && room && accommodation) {
			await billings.create({
				billingType: 'water',
				accommodationId: accommodation.id,
				status: 'calculated',
				unit: unit,
				price: price,
				priceDiff: priceDiff,
				totalPay: totalPay,
				createdAt: date,
				updatedAt: date,
			});
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
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
							attributes: ['billing_type', 'unit', 'price', 'price_diff', 'total_pay', 'created_at'],
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
							attributes: ['billing_type', 'unit', 'price', 'price_diff', 'total_pay', 'created_at'],
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
			res.status(200).json({ status: 'success no data', status_code: 204 });
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
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const wb = new xl.Workbook();
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
			var options = {
				margins: {
					left: 1.5,
					right: 1.5,
				},
				sheetView: {
					zoomScale: 90, // Defaults to 100
					zoomScaleNormal: 100, // Defaults to 100
					zoomScalePageLayoutView: 100, // Defaults to 100
				},
				sheetFormat: {
					baseColWidth: 13, // Defaults to 10. Specifies the number of characters of the maximum digit width of the normal style's font. This value does not include margin padding or extra padding for gridlines. It is only the number of characters.,
					defaultRowHeight: 20,
					thickBottom: false, // 'True' if rows have a thick bottom border by default.
					thickTop: true, // 'True' if rows have a thick top border by default.
				},
				sheetProtection: {
					// same as "Protect Sheet" in Review tab of Excel
					autoFilter: true, // True means that that user will be unable to modify this setting
					deleteColumns: true,
					deleteRows: true,
					formatCells: true,
					formatColumns: true,
					formatRows: true,
					insertColumns: true,
					insertHyperlinks: true,
					insertRows: true,
					objects: true,
					sheet: true,
					sort: true,
				},
			};
			const ws = wb.addWorksheet('sheetname', options);
			// header satart
			const headerRows = 3;
			ws.cell(headerRows, 1)
				.string('ลำดับ')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
			await wb.write('Water-Bills-Data-Export' + now + '.xlsx');
			await delay(2000);
			res.download(
				'/home/eznos/Desktop/BMS-Back-Office-API/' + 'Water-Bills-Data-Export' + now + '.xlsx',
				'Water-Bills-Data-Export' + now + '.xlsx',
				function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log('GGG');
					}
				}
			);
			await delay(3000);
			var filePath = '/home/eznos/Desktop/BMS-Back-Office-API/' + 'Water-Bills-Data-Export' + now + '.xlsx';
			fs.unlinkSync(filePath);
		}
		// new json to excel
		// if (bills) {
		// 	const dataToExport = await users.findAll({
		// 		where: { id: id, deleted: false },
		// 		include: [
		// 			{
		// 				model: accommodations,
		// 				attributes: ['id', 'host'],
		// 				where: { userId: id, host: true, deleted: false },
		// 				include: [
		// 					{
		// 						model: billings,
		// 						attributes: [
		// 							'id',
		// 							'billing_type',
		// 							'status',
		// 							'unit',
		// 							'price',
		// 							'priceDiff',
		// 							'totalPay',
		// 							'createdAt',
		// 							'updatedAt',
		// 						],
		// 						where: {
		// 							billing_type: 'water',
		// 							updated_at: { [Op.between]: [startDate, endDate] },
		// 						},
		// 					},
		// 					{
		// 						model: rooms,
		// 						attributes: [
		// 							'id',
		// 							'building_id',
		// 							'roomNo',
		// 							'roomType',
		// 							'waterNo',
		// 							'waterMeterNo',
		// 							'status',
		// 						],
		// 						include: [
		// 							{
		// 								model: zones,
		// 								attributes: ['id', 'name'],
		// 							},
		// 							{
		// 								model: waterZones,
		// 								attributes: ['id', 'name'],
		// 							},
		// 							{
		// 								model: buildings,
		// 								attributes: ['id', 'name'],
		// 							},
		// 						],
		// 					},
		// 				],
		// 			},
		// 		],
		// 		attributes: ['id', 'rank', 'affiliation', 'firstName', 'lastName'],
		// 	});
		// 	if (dataToExport.length) {
		// 		const workBook = XLSX.utils.book_new();
		// 		dataToExport.forEach((item, i) => {
		// 			XLSX.utils.json_to_sheet([
		// 				{ S: item.firstName, h: i, e: 3, e_1: 4, t: 5, J: 6, S_1: 7 },
		// 			], { header: ["S", "h", "e", "e_1", "t", "J", "S_1"] });
		// 		})
		// 		XLSX.utils.book_append_sheet(workBook, 'Sheet 1');
		// 		XLSX.writeFile(workBook, '/home/eznos/Desktop/BMS-Back-Office-API/Water-Bills-Data-Export.xlsx');
		// 		console.log(dataToExport)
		// 	}

		// }
		else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
	} else {
		return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
	}
};

const exportHistory = async (req, res) => {
	const firstName = req.body.firstName;
	const lastName = req.body.lastName;
	const rank = req.body.rank;
	const wb = new xl.Workbook();
	try {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		// const electric = await users.findOne({
		// 	include: [
		// 		{
		// 			model: accommodations,
		// 			attributes: ['host'],
		// 			where: {
		// 				deleted: 'false',
		// 			},
		// 			include: [
		// 				{
		// 					model: billings,
		// 					attributes: ['billing_type', 'unit', 'price', 'price_diff', 'total_pay', 'updated_at'],
		// 					where: {
		// 						billing_type: 'electricity',
		// 					},
		// 				},
		// 			],
		// 		},
		// 	],
		// 	where: {
		// 		rank: rank,
		// 		firstName: firstName,
		// 		lastName: lastName,
		// 	},
		// 	attributes: ['id'],
		// });
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
							attributes: ['billingType', 'unit', 'price', 'priceDiff', 'totalPay', 'updatedAt'],
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
			const ws = wb.addWorksheet('Data', {
				disableRowSpansOptimization: true,
			});
			const headerRows = 3;
			ws.cell(1, 1)
				.string(rank)
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
			ws.cell(1, 2)
				.string(firstName)
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
			ws.cell(1, 3)
				.string(lastName)
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
				.string('เดือน')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('จำนวนหน่วย')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('ค่าน้ำ')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('ค่าน้ำส่วนต่าง')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('ค่าใช้จ่ายรวม')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
			const data = waterbill.accommodations[0].billings;
			if (data.length) {
				data.forEach((item, i) => {
					const currentRow = i + startRow;
					ws.cell(currentRow, 1)
						.number(i + 1)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
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
						.date(item.updatedAt)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
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
						.number(item.unit)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
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
						.number(item.price)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
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
						.number(item.priceDiff)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
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
						.number(item.totalPay)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
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
			await wb.write('History-Data-Export.xlsx');
			await delay(2000);
			await res.download(
				'/home/eznos/Desktop/BMS-Back-Office-API/History-Data-Export.xlsx',
				'History-Data-Export.xlsx',
				function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log('GGG');
					}
				}
			);
			await delay(3000);
			var filePath = '/home/eznos/Desktop/BMS-Back-Office-API/History-Data-Export.xlsx';
			fs.unlinkSync(filePath);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

// electrontonic API
const electric = async (req, res) => {
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
								'total_pay',
								'created_at',
								'updated_at',
							],
							where: {
								billing_type: 'electricity',
								created_at: { [Op.between]: [startDate, endDate] },
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

const updeteEletric = async (req, res) => {
	const id = req.query.id;
	var now = new Date();
	var startDate = new Date(now.getFullYear() + 0, 1, 1);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	console.log(id);
	// const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const { unitPrice, unit, billing_cycle } = req.body;
	const accommodation = await accommodations.findOne({ where: { user_id: id, host: true, deleted: false } });
	console.log(accommodation);
	const billing = await billings.findOne({
		where: {
			accommodation_id: accommodation.id,
			billingType: 'electricity',
			updated_at: { [Op.between]: [startDate, endDate] },
		},
	});
	try {
		// if (getRefreshTokenFromHeader && getRefreshTokenFromHeader in TokenList.TokenList) {
		if (billing) {
			const price = Math.floor(unitPrice * unit);
			const updateUnit = await billings.update({ unit: unit }, { where: { id: billing.id } });
			const updatePrice = await billings.update({ price: price }, { where: { id: billing.id } });
			const updateStatus = await billings.update({ status: 'in_progress' }, { where: { id: billing.id } });
			const updatebillCycle = await billings.update({ updatedAt: billing_cycle }, { where: { id: billing.id } });
			if (updateUnit && updatePrice && updateStatus && updatebillCycle) {
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			} else {
				return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
			}
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

const createElectricityBill = async (req, res) => {
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	var now = new Date();
	var startDate = new Date(now.getFullYear() + 0, 1, 1);
	var endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
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
			const accommodation = await accommodations.findAll({
				where: { roomId: roomIds, userId: userIds, host: true, deleted: false },
			});
			const accomIds = [];
			for (let i = 0; i < accommodation.length; i++) {
				accomIds.push(accommodation[i].id);
			}
			const bills = await billings.findAll({
				where: {
					billingType: 'electricity',
					accommodationId: accomIds,
					createdAt: { [Op.between]: [startDate, endDate] },
				},
			});
			if (bills.length == 0) {
				for (let i = 0; i < accommodation.length; i++) {
					await billings.create({
						billingType: 'electricity',
						accommodationId: accommodation[i].id,
						status: 'draft',
						unit: 0,
						price: 0,
						totalPay: 0,
					});
				}
				return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
			} else {
				res.status(401).json({
					status: 'unauthorized',
					error_message: 'bills has been created',
					status_code: 401,
				});
			}
		} else {
			return Response(res, INVALID_REFRESH_TOKEN, UNAUTHORIZED_CODE);
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};
const createOldElectricityBill = async (req, res) => {
	const { rank, firstName, lastName, zone, building, roomNo, date, unit, price, totalPay } = req.body;
	try {
		console.log(req.body);
		const user = await users.findOne({ where: { rank: rank, firstName: firstName, lastName: lastName } });
		const room = await rooms.findOne({ where: { zoneId: zone, buildingId: building, roomNo: roomNo } });
		console.log(room);
		const accommodation = await accommodations.findOne({
			where: { roomId: room.id, userId: user.id, host: true, deleted: false },
		});
		console.log(accommodation);
		if (user && room && accommodation) {
			await billings.create({
				billingType: 'electricity',
				accommodationId: accommodation.id,
				status: 'in_progress',
				unit: unit,
				price: price,
				totalPay: totalPay,
				createdAt: date,
				updatedAt: date,
			});
			return Response(res, SUCCESS_STATUS, NO_CONTENT_CODE);
		} else {
			return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};
const exportElectricBills = async (req, res) => {
	const id = req.body.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const wb = new xl.Workbook();
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
									billing_type: 'electricity',
									created_at: { [Op.between]: [startDate, endDate] },
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
			var options = {
				margins: {
					left: 1.5,
					right: 1.5,
				},
				sheetView: {
					zoomScale: 90, // Defaults to 100
					zoomScaleNormal: 100, // Defaults to 100
					zoomScalePageLayoutView: 100, // Defaults to 100
				},
				sheetFormat: {
					baseColWidth: 13, // Defaults to 10. Specifies the number of characters of the maximum digit width of the normal style's font. This value does not include margin padding or extra padding for gridlines. It is only the number of characters.,
					defaultRowHeight: 20,
					thickBottom: false, // 'True' if rows have a thick bottom border by default.
					thickTop: true, // 'True' if rows have a thick top border by default.
				},
				sheetProtection: {
					// same as "Protect Sheet" in Review tab of Excel
					autoFilter: true, // True means that that user will be unable to modify this setting
					deleteColumns: true,
					deleteRows: true,
					formatCells: true,
					formatColumns: true,
					formatRows: true,
					insertColumns: true,
					insertHyperlinks: true,
					insertRows: true,
					objects: true,
					sheet: true,
					sort: true,
				},
			};
			const ws = wb.addWorksheet('sheetname', options);
			// header satart
			const headerRows = 3;
			ws.cell(headerRows, 1)
				.string('ลำดับ')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
						horizontal: ['justify'],
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
				.string('เลขผู้ใช้ไฟฟ้า')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('เลขมิเตอร์ไฟฟ้า')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('รอบบิล')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('จำนวนหน่วย')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('ค่าไฟฟ้า')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('ค่าไฟฟ้ารวม')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
				.string('สถานะ')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['justify'],
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.string(item.accommodations[0].room.electricityNo)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.string(item.accommodations[0].room.electricityMeterNo)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.date(item.accommodations[0].billings[0].createdAt)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.number(item.accommodations[0].billings[0].unit)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.number(item.accommodations[0].billings[0].price)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.number(item.accommodations[0].billings[0].totalPay)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
						.string(item.accommodations[0].billings[0].status)
						.style({
							alignment: {
								vertical: ['center'],
								horizontal: ['justify'],
								shrinkToFit: true,
								wrapText: true,
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
			await wb.write('Electric-Bills-Data-Export' + now + '.xlsx');
			await delay(2000);
			res.download(
				'/home/eznos/Desktop/BMS-Back-Office-API/' + 'Electric-Bills-Data-Export' + now + '.xlsx',
				'Electric-Bills-Data-Export' + now + '.xlsx',
				function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log('GGG');
					}
				}
			);
			await delay(3000);
			var filePath = '/home/eznos/Desktop/BMS-Back-Office-API/' + 'Electric-Bills-Data-Export' + now + '.xlsx';
			fs.unlinkSync(filePath);
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
module.exports.ExportHistory = exportHistory;
module.exports.CreateOldWaterBill = createOldWaterBill;
module.exports.CreateElectricityBill = createElectricityBill;
module.exports.CreateOldElectricityBill = createOldElectricityBill;
module.exports.ExportElectricBills = exportElectricBills;
