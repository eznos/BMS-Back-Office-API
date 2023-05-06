const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const billings = sequelize.define(
		'billings',
		{
			id: {
				unique: true,
				allowNull: false,
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				field: 'id',
				comment: 'ไอดีของตาราง',
			},
			billingType: {
				type: DataTypes.ENUM,
				values: ['electricity', 'water'],
				field: 'billing_type',
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM,
				values: ['paid', 'un_paid'],
				field: 'status',
				allowNull: false,
			},
			beforeUnit: {
				type: DataTypes.INTEGER,
				field: 'before_unit',
			},
			afterUnit: {
				type: DataTypes.INTEGER,
				field: 'after_unit',
			},
			unit: {
				type: DataTypes.INTEGER,
				field: 'unit',
			},
			price: {
				type: DataTypes.FLOAT,
				field: 'price',
			},
			priceDiff: {
				type: DataTypes.FLOAT,
				field: 'price_diff',
			},
			totalPay: {
				type: DataTypes.FLOAT,
				field: 'total_pay',
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				field: 'created_at',
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				field: 'updated_at',
			},
		},
		{
			sequelize,
			modelName: 'users',
			tableName: 'billings',
			timestamps: true,
		}
	);

	billings.associate = (models) => {
		billings.belongsTo(models.accommodations, {
			foreignKey: { name: 'accommodationId', field: 'accommodation_id' },
		});
	};

	return billings;
};
