const { Response } = require('../../utils/response.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { OK_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG } = require('../../constants/error-message.constant');
const { users, zones, waterZones, accommodations, rooms, buildings, billings } = require('../repositories/models');
const { Op } = require('sequelize');
const xl = require('excel4node');

var fs = require('fs');
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
				createdAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		// feb
		const sumOfBillsInSuranaraiFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		// mar
		const sumOfBillsInSuranaraiMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		// apr
		const sumOfBillsInSuranaraiApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		// may
		const sumOfBillsInSuranaraiMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		// jun
		const sumOfBillsInSuranaraiJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		//jul
		const sumOfBillsInSuranaraiJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		//aug
		const sumOfBillsInSuranaraiAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		// sep
		const sumOfBillsInSuranaraiSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		// oct
		const sumOfBillsInSuranaraiOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		// Nov
		const sumOfBillsInSuranaraiNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		// Dec
		const sumOfBillsInSuranaraiDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstDec, lastDec] },
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
				createdAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		// feb
		const sumOfBillsInCenterFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		// mar
		const sumOfBillsInCenterMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		// apr
		const sumOfBillsInCenterApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		// may
		const sumOfBillsInCenterMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		// jun
		const sumOfBillsInCenterJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		//jul
		const sumOfBillsInCenterJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		//aug
		const sumOfBillsInCenterAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		// sep
		const sumOfBillsInCenterSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		// oct
		const sumOfBillsInCenterOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		// Nov
		const sumOfBillsInCenterNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		// Dec
		const sumOfBillsInCenterDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstDec, lastDec] },
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
				createdAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		// feb
		const sumOfBillsInAsadangFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		// mar
		const sumOfBillsInAsadangMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		// apr
		const sumOfBillsInAsadangApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		// may
		const sumOfBillsInAsadangMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		// jun
		const sumOfBillsInAsadangJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		//jul
		const sumOfBillsInAsadangJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		//aug
		const sumOfBillsInAsadangAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		// sep
		const sumOfBillsInAsadangSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		// oct
		const sumOfBillsInAsadangOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		// Nov
		const sumOfBillsInAsadangNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		// Dec
		const sumOfBillsInAsadangDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstDec, lastDec] },
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
			where: { deleted: true, createdAt: { [Op.between]: [startMonth, endMonth] } },
		});
		const stayInMonth = await accommodations.findAll({
			where: { host: true, deleted: false, createdAt: { [Op.between]: [startMonth, endMonth] } },
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

const exportOverviews = async (req, res) => {
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const wb = new xl.Workbook();
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
				createdAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		if (sumOfBillsInSuranaraiJan == null) {
			this.sumOfBillsInSuranaraiJan = 0;
		} else {
			this.sumOfBillsInSuranaraiJan = sumOfBillsInSuranaraiJan;
		}
		// feb
		const sumOfBillsInSuranaraiFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		if (sumOfBillsInSuranaraiFeb == null) {
			this.sumOfBillsInSuranaraiFeb = 0;
		} else {
			this.sumOfBillsInSuranaraiFeb = sumOfBillsInSuranaraiFeb;
		}
		// mar
		const sumOfBillsInSuranaraiMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		if (sumOfBillsInSuranaraiMar == null) {
			this.sumOfBillsInSuranaraiMar = 0;
		} else {
			this.sumOfBillsInSuranaraiMar = sumOfBillsInSuranaraiMar;
		}
		// apr
		const sumOfBillsInSuranaraiApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		if (sumOfBillsInSuranaraiApr == null) {
			this.sumOfBillsInSuranaraiApr = 0;
		} else {
			this.sumOfBillsInSuranaraiApr = sumOfBillsInSuranaraiApr;
		}
		// may
		const sumOfBillsInSuranaraiMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		if (sumOfBillsInSuranaraiMay == null) {
			this.sumOfBillsInSuranaraiMay = 0;
		} else {
			this.sumOfBillsInSuranaraiMay = sumOfBillsInSuranaraiMay;
		}
		// jun
		const sumOfBillsInSuranaraiJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		if (sumOfBillsInSuranaraiJun == null) {
			this.sumOfBillsInSuranaraiJun = 0;
		} else {
			this.sumOfBillsInSuranaraiJun = sumOfBillsInSuranaraiJun;
		}
		//jul
		const sumOfBillsInSuranaraiJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		if (sumOfBillsInSuranaraiJul == null) {
			this.sumOfBillsInSuranaraiJul = 0;
		} else {
			this.sumOfBillsInSuranaraiJul = sumOfBillsInSuranaraiJul;
		}
		//aug
		const sumOfBillsInSuranaraiAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		if (sumOfBillsInSuranaraiAug == null) {
			this.sumOfBillsInSuranaraiAug = 0;
		} else {
			this.sumOfBillsInSuranaraiAug = sumOfBillsInSuranaraiAug;
		}
		// sep
		const sumOfBillsInSuranaraiSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		if (sumOfBillsInSuranaraiSep == null) {
			this.sumOfBillsInSuranaraiSep = 0;
		} else {
			this.sumOfBillsInSuranaraiSep = sumOfBillsInSuranaraiSep;
		}
		// oct
		const sumOfBillsInSuranaraiOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		if (sumOfBillsInSuranaraiOct == null) {
			this.sumOfBillsInSuranaraiOct = 0;
		} else {
			this.sumOfBillsInSuranaraiOct = sumOfBillsInSuranaraiOct;
		}
		// Nov
		const sumOfBillsInSuranaraiNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		if (sumOfBillsInSuranaraiNov == null) {
			this.sumOfBillsInSuranaraiNov = 0;
		} else {
			this.sumOfBillsInSuranaraiNov = sumOfBillsInSuranaraiNov;
		}
		// Dec
		const sumOfBillsInSuranaraiDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInSuranaraiIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstDec, lastDec] },
			},
		});
		if (sumOfBillsInSuranaraiDec == null) {
			this.sumOfBillsInSuranaraiDec = 0;
		} else {
			this.sumOfBillsInSuranaraiDec = sumOfBillsInSuranaraiDec;
		}
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
				createdAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		if (sumOfBillsInCenterJan == null) {
			this.sumOfBillsInCenterJan = 0;
		} else {
			this.sumOfBillsInCenterJan = sumOfBillsInCenterJan;
		}
		// feb
		const sumOfBillsInCenterFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		if (sumOfBillsInCenterFeb == null) {
			this.sumOfBillsInCenterFeb = 0;
		} else {
			this.sumOfBillsInCenterFeb = sumOfBillsInCenterFeb;
		}
		// mar
		const sumOfBillsInCenterMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		if (sumOfBillsInCenterMar == null) {
			this.sumOfBillsInCenterMar = 0;
		} else {
			this.sumOfBillsInCenterMar = sumOfBillsInCenterMar;
		}
		// apr
		const sumOfBillsInCenterApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		if (sumOfBillsInCenterApr == null) {
			this.sumOfBillsInCenterApr = 0;
		} else {
			this.sumOfBillsInCenterApr = sumOfBillsInCenterApr;
		}
		// may
		const sumOfBillsInCenterMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		if (sumOfBillsInCenterMay == null) {
			this.sumOfBillsInCenterMay = 0;
		} else {
			this.sumOfBillsInCenterMay = sumOfBillsInCenterMay;
		}
		// jun
		const sumOfBillsInCenterJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		if (sumOfBillsInCenterJun == null) {
			this.sumOfBillsInCenterJun = 0;
		} else {
			this.sumOfBillsInCenterJun = sumOfBillsInCenterJun;
		}
		//jul
		const sumOfBillsInCenterJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		if (sumOfBillsInCenterJul == null) {
			this.sumOfBillsInCenterJul = 0;
		} else {
			this.sumOfBillsInCenterJul = sumOfBillsInCenterJul;
		}
		//aug
		const sumOfBillsInCenterAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		if (sumOfBillsInCenterAug == null) {
			this.sumOfBillsInCenterAug = 0;
		} else {
			this.sumOfBillsInCenterAug = sumOfBillsInCenterAug;
		}
		// sep
		const sumOfBillsInCenterSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		if (sumOfBillsInCenterSep == null) {
			this.sumOfBillsInCenterSep = 0;
		} else {
			this.sumOfBillsInCenterSep = sumOfBillsInCenterSep;
		}
		// oct
		const sumOfBillsInCenterOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		if (sumOfBillsInCenterOct == null) {
			this.sumOfBillsInCenterOct = 0;
		} else {
			this.sumOfBillsInCenterOct = sumOfBillsInCenterOct;
		}
		// Nov
		const sumOfBillsInCenterNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		if (sumOfBillsInCenterNov == null) {
			this.sumOfBillsInCenterNov = 0;
		} else {
			this.sumOfBillsInCenterNov = sumOfBillsInCenterNov;
		}
		// Dec
		const sumOfBillsInCenterDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInCenterIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstDec, lastDec] },
			},
		});
		if (sumOfBillsInCenterDec == null) {
			this.sumOfBillsInCenterDec = 0;
		} else {
			this.sumOfBillsInCenterDec = sumOfBillsInCenterDec;
		}
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
				createdAt: { [Op.between]: [firstJan, lastJan] },
			},
		});
		if (sumOfBillsInAsadangJan == null) {
			this.sumOfBillsInAsadangJan = 0;
		} else {
			this.sumOfBillsInAsadangJan = sumOfBillsInAsadangJan;
		}
		// feb
		const sumOfBillsInAsadangFeb = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstFeb, lastFeb] },
			},
		});
		if (sumOfBillsInAsadangFeb == null) {
			this.sumOfBillsInAsadangFeb = 0;
		} else {
			this.sumOfBillsInAsadangFeb = sumOfBillsInAsadangFeb;
		}
		// mar
		const sumOfBillsInAsadangMar = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMar, lastMar] },
			},
		});
		if (sumOfBillsInAsadangMar == null) {
			this.sumOfBillsInAsadangMar = 0;
		} else {
			this.sumOfBillsInAsadangMar = sumOfBillsInAsadangMar;
		}
		// apr
		const sumOfBillsInAsadangApr = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstApr, lastApr] },
			},
		});
		if (sumOfBillsInAsadangApr == null) {
			this.sumOfBillsInAsadangApr = 0;
		} else {
			this.sumOfBillsInAsadangApr = sumOfBillsInAsadangApr;
		}
		// may
		const sumOfBillsInAsadangMay = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstMay, lastMay] },
			},
		});
		if (sumOfBillsInAsadangMay == null) {
			this.sumOfBillsInAsadangMay = 0;
		} else {
			this.sumOfBillsInAsadangMay = sumOfBillsInAsadangMay;
		}
		// jun
		const sumOfBillsInAsadangJun = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJun, lastJun] },
			},
		});
		if (sumOfBillsInAsadangJun == null) {
			this.sumOfBillsInAsadangJun = 0;
		} else {
			this.sumOfBillsInAsadangJun = sumOfBillsInAsadangJun;
		}
		//jul
		const sumOfBillsInAsadangJul = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstJul, lastJul] },
			},
		});
		if (sumOfBillsInAsadangJul == null) {
			this.sumOfBillsInAsadangJul = 0;
		} else {
			this.sumOfBillsInAsadangJul = sumOfBillsInAsadangJul;
		}
		//aug
		const sumOfBillsInAsadangAug = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstAug, lastAug] },
			},
		});
		if (sumOfBillsInAsadangAug == null) {
			this.sumOfBillsInAsadangAug = 0;
		} else {
			this.sumOfBillsInAsadangAug = sumOfBillsInAsadangAug;
		}
		// sep
		const sumOfBillsInAsadangSep = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstSep, lastSep] },
			},
		});
		if (sumOfBillsInAsadangSep == null) {
			this.sumOfBillsInAsadangSep = 0;
		} else {
			this.sumOfBillsInAsadangSep = sumOfBillsInAsadangSep;
		}
		// oct
		const sumOfBillsInAsadangOct = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstOct, lastOct] },
			},
		});
		if (sumOfBillsInAsadangOct == null) {
			this.sumOfBillsInAsadangOct = 0;
		} else {
			this.sumOfBillsInAsadangOct = sumOfBillsInAsadangOct;
		}
		// Nov
		const sumOfBillsInAsadangNov = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstNov, lastNov] },
			},
		});
		if (sumOfBillsInAsadangNov == null) {
			this.sumOfBillsInAsadangNov = 0;
		} else {
			this.sumOfBillsInAsadangNov = sumOfBillsInAsadangNov;
		}
		// Dec
		const sumOfBillsInAsadangDec = await billings.sum('totalPay', {
			where: {
				accommodationId: billsInAsadangIds,
				billingType: 'water',
				createdAt: { [Op.between]: [firstDec, lastDec] },
			},
		});
		if (sumOfBillsInAsadangDec == null) {
			this.sumOfBillsInAsadangDec = 0;
		} else {
			this.sumOfBillsInAsadangDec = sumOfBillsInAsadangDec;
		}
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
			where: { deleted: true, createdAt: { [Op.between]: [startMonth, endMonth] } },
		});
		const stayInMonth = await accommodations.findAll({
			where: { host: true, deleted: false, createdAt: { [Op.between]: [startMonth, endMonth] } },
		});
		const numberOfResident = Resident.length;
		const numberOfRoom = room.length;
		const numberOfExitInMount = exitInMonth.length;
		const numberOfComeInMonth = stayInMonth.length;
		// end the info card

		const ws = wb.addWorksheet('Data', {
			disableRowSpansOptimization: true,
		});
		// header satart
		const headerRows1 = 3;

		ws.cell(headerRows1, 2)
			.string('มกราคม')
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
		ws.cell(headerRows1, 3)
			.string('กุมภาพันธ์')
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
		ws.cell(headerRows1, 4)
			.string('มีนาคม')
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
		ws.cell(headerRows1, 5)
			.string('เมษายน')
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
		ws.cell(headerRows1, 6)
			.string('พฤษภาคม')
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
		ws.cell(headerRows1, 7)
			.string('มิถุนายน')
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
		ws.cell(headerRows1, 8)
			.string('กรกฎาคม')
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
		ws.cell(headerRows1, 9)
			.string('สิงหาคม')
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
		ws.cell(headerRows1, 10)
			.string('กันยายน')
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
		ws.cell(headerRows1, 11)
			.string('ตุลาคม')
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
		ws.cell(headerRows1, 12)
			.string('พฤศจิกายน')
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
		ws.cell(headerRows1, 13)
			.string('ธันวาคม')
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
		ws.cell(headerRows1, 14)
			.string('รวม')
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
		ws.cell(4, 1)
			.string('เขตส่วนกลาง')
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
		ws.cell(5, 1)
			.string('เขตอัษฎางค์')
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
		ws.cell(6, 1)
			.string('เขตสุรนารายณ์')
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

		ws.cell(4, 16)
			.string('จำนวนผู้อยู่อาศัยรวม')
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
		ws.cell(4, 17)
			.string('จำนวนห้องว่าง')
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
		ws.cell(4, 18)
			.string('จำนวนผู้เข้าพักอาศัยเดือนนี้')
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
		ws.cell(4, 19)
			.string('จำนวนผู้ย้ายออกในเดือนนี้')
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
		if (roomsInCenter || roomsInAsadang || roomsInSuranarai) {
			// center data
			ws.cell(4, 2)
				.number(this.sumOfBillsInCenterJan)
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
			ws.cell(4, 3)
				.number(this.sumOfBillsInCenterFeb)
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
			ws.cell(4, 4)
				.number(this.sumOfBillsInCenterMar)
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
			ws.cell(4, 5)
				.number(this.sumOfBillsInCenterApr)
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
			ws.cell(4, 6)
				.number(this.sumOfBillsInCenterMay)
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
			ws.cell(4, 7)
				.number(this.sumOfBillsInCenterJun)
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
			ws.cell(4, 8)
				.number(this.sumOfBillsInCenterJul)
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
			ws.cell(4, 9)
				.number(this.sumOfBillsInCenterAug)
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
			ws.cell(4, 10)
				.number(this.sumOfBillsInCenterSep)
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
			ws.cell(4, 11)
				.number(this.sumOfBillsInCenterOct)
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
			ws.cell(4, 12)
				.number(this.sumOfBillsInCenterNov)
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
				.number(this.sumOfBillsInCenterDec)
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

			ws.cell(5, 2)
				.number(this.sumOfBillsInAsadangJan)
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
			ws.cell(5, 3)
				.number(this.sumOfBillsInAsadangFeb)
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
			ws.cell(5, 4)
				.number(this.sumOfBillsInAsadangMar)
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
			ws.cell(5, 5)
				.number(this.sumOfBillsInAsadangApr)
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
			ws.cell(5, 6)
				.number(this.sumOfBillsInAsadangMay)
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
			ws.cell(5, 7)
				.number(this.sumOfBillsInAsadangJun)
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
			ws.cell(5, 8)
				.number(this.sumOfBillsInAsadangJul)
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
			ws.cell(5, 9)
				.number(this.sumOfBillsInAsadangAug)
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
			ws.cell(5, 10)
				.number(this.sumOfBillsInAsadangSep)
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
			ws.cell(5, 11)
				.number(this.sumOfBillsInAsadangOct)
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
			ws.cell(5, 12)
				.number(this.sumOfBillsInAsadangNov)
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
				.number(this.sumOfBillsInAsadangDec)
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

			ws.cell(6, 2)
				.number(this.sumOfBillsInSuranaraiJan)
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
			ws.cell(6, 3)
				.number(this.sumOfBillsInSuranaraiFeb)
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
			ws.cell(6, 4)
				.number(this.sumOfBillsInSuranaraiMar)
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
			ws.cell(6, 5)
				.number(this.sumOfBillsInSuranaraiApr)
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
			ws.cell(6, 6)
				.number(this.sumOfBillsInSuranaraiMay)
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
			ws.cell(6, 7)
				.number(this.sumOfBillsInSuranaraiJun)
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
			ws.cell(6, 8)
				.number(this.sumOfBillsInSuranaraiJul)
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
			ws.cell(6, 9)
				.number(this.sumOfBillsInSuranaraiAug)
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
			ws.cell(6, 10)
				.number(this.sumOfBillsInSuranaraiSep)
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
			ws.cell(6, 11)
				.number(this.sumOfBillsInSuranaraiOct)
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
			ws.cell(6, 12)
				.number(this.sumOfBillsInSuranaraiNov)
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
			ws.cell(6, 13)
				.number(this.sumOfBillsInSuranaraiDec)
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
				.formula('SUM( B4:M4 )')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['left'],
					},
					font: {
						color: '#FF0800',
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
				.formula('SUM( B5:M5 )')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['left'],
					},
					font: {
						color: '#FF0800',
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
				.formula('SUM( B6:M6 )')
				.style({
					alignment: {
						vertical: ['center'],
						horizontal: ['left'],
					},
					font: {
						color: '#FF0800',
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
		}
		if (numberOfResident || numberOfRoom || numberOfExitInMount || numberOfComeInMonth) {
			ws.cell(5, 16)
				.number(numberOfResident)
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
			ws.cell(5, 17)
				.number(numberOfRoom)
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
			ws.cell(5, 18)
				.number(numberOfExitInMount)
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
			ws.cell(5, 19)
				.number(numberOfComeInMonth)
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
		}
		// end data
		wb.write('Overviews-Data-Export.xlsx');
		await delay(2000);
		res.download('/opt/render/project/Overviews-Data-Export.xlsx', 'Overviews-Data-Export.xlsx', function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log('GGG');
			}
		});
		await delay(3000);
		var filePath = '/opt/render/project/Overviews-Data-Export.xlsx';
		fs.unlinkSync(filePath);
	} catch (err) {
		return HandlerError(res, CustomError(SOMETHING_WENT_WRONG));
	}
};

module.exports.ChartAndInfo = chartAndInfo;
module.exports.ExportOverviews = exportOverviews;
