const { Response } = require('../../utils/response.util');
const { CustomError, HandlerError } = require('../../utils/error.util');
const { SUCCESS_STATUS } = require('../../constants/http-status.constant');
const { NO_CONTENT_CODE, OK_CODE, UNAUTHORIZED_CODE } = require('../../constants/http-status-code.constant');
const { SOMETHING_WENT_WRONG, INVALID_REFRESH_TOKEN } = require('../../constants/error-message.constant');
const { users, accommodations, billings, rooms, zones, buildings } = require('../repositories/models');
const TokenList = require('./auth.controller');
const water = async (req, res) => {
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

const updateWater = async (req, res) => {
	const id = req.query.id;
	const getRefreshTokenFromHeader = await req.headers['x-refresh-token'];
	const { unit, price, status } = req.body;
	const billing = await billings.findOne({ where: { id: id, billingType: 'water' } });
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
			res.status(401).json({ status: 'unauthorized', error_message: 'unauthorized', status_code: 401 });
		} else {
			res.status(200).json({ status: 'success no data', status_code: 200 });
		}
	} catch (err) {
		return HandlerError(res, err);
	}
};

// const differencePrice = async (req,res) =>{

// }

module.exports.Water = water;
module.exports.UpdateWater = updateWater;
module.exports.Electric = electric;
module.exports.UpdeteEletric = updeteEletric;
module.exports.History = history;
// module.exports.DifferencePrice = differencePrice;
