const { Response } = require('../../utils/response.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { OK_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG } = require('../../constants/error-message.constant');
const { users, zones, waterZones, accommodations, rooms, buildings, billings } = require('../repositories/models');
const { Op } = require('sequelize');

const chartAndInfo = async (req, res) => {
	try {
		var now = new Date();
		var startMonth = new Date(now.getFullYear() + 0, 1, 1);
		var endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		var year = now.getFullYear();
		var jan = 0; // January
		var feb = 1; // February
		var mar = 2; // March
		var apr = 3; // April
		var may = 4; // May
		var jun = 5; // June
		var jul = 6; // July
		var aug = 7; // August
		var sep = 8; // September
		var oct = 9; // October
		var nov = 10; // November
		var dec = 11; // December

		const firstJan = new Date(year, jan, +1, 0);
		const lastJan = new Date(year, jan + 1, 1);

		const firstFeb = new Date(year, feb, +1, 0);
		const lastFeb = new Date(year, feb + 1, 1);

		const firstMar = new Date(year, mar, +1, 0);
		const lastMar = new Date(year, mar + 1, 1);

		const firstApr = new Date(year, apr, +1, 0);
		const lastApr = new Date(year, apr + 1, 1);

		const firstMay = new Date(year, may, +1, 0);
		const lastMay = new Date(year, may + 1, 1);

		const firstJun = new Date(year, jun, +1, 0);
		const lastJun = new Date(year, jun + 1, 1);

		const firstJul = new Date(year, jul, +1, 0);
		const lastJul = new Date(year, jul + 1, 1);

		const firstAug = new Date(year, aug, +1, 0);
		const lastAug = new Date(year, aug + 1, 1);

		const firstSep = new Date(year, sep, +1, 0);
		const lastSep = new Date(year, sep + 1, 1);

		const firstOct = new Date(year, oct, +1, 0);
		const lastOct = new Date(year, oct + 1, 1);

		const firstNov = new Date(year, nov, +1, 0);
		const lastNov = new Date(year, nov + 1, 1);

		const firstDec = new Date(year, dec, +1, 0);
		const lastDec = new Date(year, dec + 1, 1);

		// const zone = await zones.findAll({})
		const Center = '3f145295-af79-4c6f-83a3-ac7ef5a0e157';
		const Asadang = '44bd0cc4-21b3-40bd-ae41-5783b3f88e6f';
		const Suranarai = '016df2e2-5cc1-4eb3-b765-f45cc33e00eb';

		const roomsInCenter = await rooms.findAll({ where: { zoneId: Center } });
		const roomsInAsadang = await rooms.findAll({ where: { zoneId: Asadang } });
		const roomsInSuranarai = await rooms.findAll({ where: { zoneId: Suranarai } });

		// start of Suranarai sum of bill in thhi year but water bills
		const roomsInSuranaraiIds = [];
		for (let i = 0; i < roomsInSuranarai.length; i++) {
			roomsInSuranaraiIds.push(roomsInSuranarai[i].id);
		}
		const accomsInSuranarai = await accommodations.findAll({ where: { roomId: roomsInSuranaraiIds } });
		const billsInSuranaraiIds = [];
		for (let i = 0; i < accomsInSuranarai.length; i++) {
			billsInSuranaraiIds.push(accomsInSuranarai[i].id);
		}
		// jan
		const sumOfBillsInSuranaraiJan = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		// feb
		const sumOfBillsInSuranaraiFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		// mar
		const sumOfBillsInSuranaraiMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		// apr
		const sumOfBillsInSuranaraiApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		// may
		const sumOfBillsInSuranaraiMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		// jun
		const sumOfBillsInSuranaraiJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		//jul
		const sumOfBillsInSuranaraiJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		//aug
		const sumOfBillsInSuranaraiAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		// sep
		const sumOfBillsInSuranaraiSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		// oct
		const sumOfBillsInSuranaraiOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		// Nov
		const sumOfBillsInSuranaraiNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		// Dec
		const sumOfBillsInSuranaraiDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstDec, lastDec] },
			},
		});
		// end of Suranarai

		// start of Center sum of bill in thhi year but water bills
		const roomsInCenterIds = [];
		for (let i = 0; i < roomsInCenter.length; i++) {
			roomsInCenterIds.push(roomsInCenter[i].id);
		}
		const accomsInCenter = await accommodations.findAll({ where: { roomId: roomsInCenterIds } });
		const billsInCenterIds = [];
		for (let i = 0; i < accomsInCenter.length; i++) {
			billsInCenterIds.push(accomsInCenter[i].id);
		}
		// jan
		const sumOfBillsInCenterJan = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		// feb
		const sumOfBillsInCenterFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		// mar
		const sumOfBillsInCenterMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		// apr
		const sumOfBillsInCenterApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		// may
		const sumOfBillsInCenterMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		// jun
		const sumOfBillsInCenterJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		//jul
		const sumOfBillsInCenterJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		//aug
		const sumOfBillsInCenterAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		// sep
		const sumOfBillsInCenterSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		// oct
		const sumOfBillsInCenterOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		// Nov
		const sumOfBillsInCenterNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		// Dec
		const sumOfBillsInCenterDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstDec, lastDec] },
			},
		});
		// end of Center

		// start of Asadang sum of bill in thhi year but water bills
		const roomsInAsadangIds = [];
		for (let i = 0; i < roomsInAsadang.length; i++) {
			roomsInAsadangIds.push(roomsInAsadang[i].id);
		}
		const accomsInAsadang = await accommodations.findAll({ where: { roomId: roomsInAsadangIds } });
		const billsInAsadangIds = [];
		for (let i = 0; i < accomsInAsadang.length; i++) {
			billsInAsadangIds.push(accomsInAsadang[i].id);
		}
		// jan
		const sumOfBillsInAsadangJan = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		// feb
		const sumOfBillsInAsadangFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		// mar
		const sumOfBillsInAsadangMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		// apr
		const sumOfBillsInAsadangApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		// may
		const sumOfBillsInAsadangMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		// jun
		const sumOfBillsInAsadangJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		//jul
		const sumOfBillsInAsadangJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		//aug
		const sumOfBillsInAsadangAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		// sep
		const sumOfBillsInAsadangSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		// oct
		const sumOfBillsInAsadangOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		// Nov
		const sumOfBillsInAsadangNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		// Dec
		const sumOfBillsInAsadangDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				updatedAt: { [Op.between]: [firstDec, lastDec] },
			},
		});
		// end

		// start the info card
		const Resident = await users.findAll({
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
		const room = await rooms.findAll({ where: { status: 'empty' } });
		const exitInMonth = await accommodations.findAll({
			where: { deleted: true, updatedAt: { [Op.between]: [startMonth, endMonth] } },
		});
		const stayInMonth = await accommodations.findAll({
			where: { host: true, deleted: false, updatedAt: { [Op.between]: [startMonth, endMonth] } },
		});
		const numberOfResident = Resident.length;
		const numberOfRoom = room.length;
		const numberOfExitInMount = exitInMonth.length;
		const numberOfComeInMonth = stayInMonth.length;
		// end the info card

		return Response(res, SUCCESS_STATUS, OK_CODE, {
			billings: {
				info: {
					numberOfResident: numberOfResident,
					numberOfRoom: numberOfRoom,
					numberOfExitInMount: numberOfExitInMount,
					numberOfComeInMonth: numberOfComeInMonth,
				},
				zone: {
					Center: {
						jan: sumOfBillsInCenterJan,
						feb: sumOfBillsInCenterFeb,
						mar: sumOfBillsInCenterMar,
						apr: sumOfBillsInCenterApr,
						may: sumOfBillsInCenterMay,
						jun: sumOfBillsInCenterJun,
						jul: sumOfBillsInCenterJul,
						aug: sumOfBillsInCenterAug,
						sep: sumOfBillsInCenterSep,
						oct: sumOfBillsInCenterOct,
						nov: sumOfBillsInCenterNov,
						dec: sumOfBillsInCenterDec,
					},
					Asadang: {
						jan: sumOfBillsInAsadangJan,
						feb: sumOfBillsInAsadangFeb,
						mar: sumOfBillsInAsadangMar,
						apr: sumOfBillsInAsadangApr,
						may: sumOfBillsInAsadangMay,
						jun: sumOfBillsInAsadangJun,
						jul: sumOfBillsInAsadangJul,
						aug: sumOfBillsInAsadangAug,
						sep: sumOfBillsInAsadangSep,
						oct: sumOfBillsInAsadangOct,
						nov: sumOfBillsInAsadangNov,
						dec: sumOfBillsInAsadangDec,
					},
					Suranarai: {
						jan: sumOfBillsInSuranaraiJan,
						feb: sumOfBillsInSuranaraiFeb,
						mar: sumOfBillsInSuranaraiMar,
						apr: sumOfBillsInSuranaraiApr,
						may: sumOfBillsInSuranaraiMay,
						jun: sumOfBillsInSuranaraiJun,
						jul: sumOfBillsInSuranaraiJul,
						aug: sumOfBillsInSuranaraiAug,
						sep: sumOfBillsInSuranaraiSep,
						oct: sumOfBillsInSuranaraiOct,
						nov: sumOfBillsInSuranaraiNov,
						dec: sumOfBillsInSuranaraiDec,
					},
				},
			},
		});
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

module.exports.ChartAndInfo = chartAndInfo;
