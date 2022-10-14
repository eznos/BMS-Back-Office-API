const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const rooms = sequelize.define(
		'rooms',
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
			roomNo: {
				type: DataTypes.STRING,
				allowNull: false,
				field: 'room_no',
			},
			roomType: {
				type: DataTypes.ENUM,
				values: ['single', 'family_1', 'family_2'],
				field: 'room_type',
			},
			electricityNo: {
				unique: true,
				type: DataTypes.STRING,
				field: 'electricity_no',
			},
			electricityMeterNo: {
				unique: true,
				type: DataTypes.STRING,
				field: 'electricity_meter_no',
			},
			waterNo: {
				unique: true,
				type: DataTypes.STRING,
				field: 'water_no',
			},
			waterMeterNo: {
				unique: true,
				type: DataTypes.STRING,
				field: 'water_meter_no',
			},
			status: {
				type: DataTypes.ENUM,
				values: ['empty', 'not_empty'],
				field: 'status',
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
			modelName: 'rooms',
			tableName: 'rooms',
			timestamps: true,
		}
	);

	rooms.associate = (models) => {
		rooms.hasMany(models.accommodations, {
			foreignKey: { name: 'roomId', field: 'room_id' },
		});
		rooms.belongsTo(models.zones, {
			foreignKey: { name: 'zoneId', field: 'zone_id' },
		});
		rooms.belongsTo(models.waterZones, {
			foreignKey: { name: 'waterZoneId', field: 'water_zone_id' },
		});
		rooms.belongsTo(models.buildings, {
			foreignKey: { name: 'buildingId', field: 'building_id' },
		});
	};

	return rooms;
};
