const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const zones = sequelize.define(
		'zones',
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
			name: {
				unique: true,
				type: DataTypes.STRING,
				allowNull: false,
				field: 'name',
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
			modelName: 'zones',
			tableName: 'zones',
			timestamps: true,
		}
	);

	zones.associate = (models) => {
		zones.hasMany(models.rooms, {
			foreignKey: { name: 'zoneID', field: 'zone_id' },
		});
		zones.hasMany(models.buildings, {
			foreignKey: { name: 'zoneID', field: 'zone_id' },
		});
		zones.hasMany(models.waterZones, {
			foreignKey: { name: 'zoneID', field: 'zone_id' },
		});
	};

	return zones;
};
