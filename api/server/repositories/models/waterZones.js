const {DataTypes} = require("sequelize")

module.exports = (sequelize, Sequelize) => {
    const waterZones = sequelize.define("waterZones", {
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
        name: {
            unique: true,
            type: DataTypes.STRING,
            allowNull: false,
            field: "name",
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
        modelName: "waterZones",
        tableName: "water_zones",
        timestamps: true,
    })

    waterZones.associate = (models) => {
        waterZones.hasMany(models.buildings, {
            foreignKey: 'water_zone_id',
            as: 'buildings',
            onUpdate: 'cascade',
            sourceKey: 'id'
        })
        waterZones.belongsTo(models.zones, {foreignKey: 'zone_id', as: 'zones', onUpdate: 'cascade', targetKey: 'id'})
        waterZones.hasMany(models.rooms, {
            foreignKey: 'water_zone_id',
            as: 'rooms',
            onUpdate: 'cascade',
            sourceKey: 'id'
        })
    }

    return waterZones
}
