//importing modules
const db = require('../../server/repositories/models/index');

const {
	users,
	accommodations,
	billings,
	buildings,
	rooms,
	/*waterZones,*/ zones,
} = db;

// find history via name lastname and rank
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
							attributes: [
								'billing_type',
								'unit',
								'price',
								'price_diff',
								'total_pay',
								'created_at',
							],
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
							attributes: [
								'billing_type',
								'unit',
								'price',
								'price_diff',
								'total_pay',
								'created_at',
							],
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
			res.status(200).json({
				status: 'success',
				status_code: 200,
				result: { electric: electric, water: waterbill },
			});
		}
		if (!electric && !waterbill) {
			res.status(401).json({
				status: 'unauthorized',
				error_message: 'unauthorized',
				status_code: 401,
			});
		} else {
			res.status(200).json({
				status: 'success no data',
				status_code: 200,
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const water = async (req, res) => {
	const date = req.query.date;
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
								'updated_at',
							],
							where: {
								billing_type: 'water',
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
		if (date && billing) {
			res.status(200).json({
				status: 'success',
				status_code: 200,
				result: billing,
			});
		} else {
			res.status(200).json({
				status: 'success',
				status_code: 200,
				result: billing,
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const electricity = async (req, res) => {
	const date = req.query.date;
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
								'updated_at',
							],
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
		if (date && billing) {
			res.status(200).json({
				status: 'success',
				status_code: 200,
				result: billing,
			});
		} else {
			res.status(200).json({
				status: 'success',
				status_code: 200,
				result: billing,
			});
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	history,
	water,
	electricity,
};
