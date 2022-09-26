const {DataTypes} = require("sequelize")

module.exports = (sequelize) => {
    const buildings = sequelize.define("buildings", {
        id: {
            unique: true,
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            field: "id",
            comment: "ไอดีของตาราง",
        },
        zoneId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            field: "zone_id",
        },
        waterZoneId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            field: "water_zone_id",
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "name",
            unique: true,
        },
        imageUrl: {
            type: DataTypes.STRING,
            field: "image_url",
        },
        lat: {
            type: DataTypes.DOUBLE,
            field: "lat",
        },
        lng: {
            type: DataTypes.DOUBLE,
            field: "lng",
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "updated_at",
        },
    }, {
        sequelize,
        modelName: "buildings",
        tableName: "buildings",
        timestamps: true,
    })

    buildings.associate = (models) => {
        buildings.belongsTo(models.zones, {foreignKey: 'zone_id', as: 'zones', onUpdate: 'cascade', targetKey: 'id'})
        buildings.belongsTo(models.waterZones, {
            foreignKey: 'water_zone_id',
            as: 'water_zones',
            onUpdate: 'cascade',
            targetKey: 'id'
        })
        buildings.hasMany(models.rooms, {foreignKey: 'building_id', as: 'rooms', onUpdate: 'cascade', sourceKey: 'id'})
    }

    return buildings
}
