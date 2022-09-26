const {DataTypes} = require("sequelize")

module.exports = (sequelize) => {
    const zones = sequelize.define("zones", {
            id: {
                unique: true,
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "id",
                comment: "ไอดีของตาราง",
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
        },
        {
            sequelize,
            modelName: "zones",
            tableName: "zones",
            timestamps: true,
        })

    zones.associate = (models) => {
        zones.hasMany(models.waterZones, {
            foreignKey: 'zone_id',
            as: 'water_zones',
            onUpdate: 'cascade',
            sourceKey: 'id'
        })
        zones.hasMany(models.buildings, {foreignKey: 'zone_id', as: 'buildings', onUpdate: 'cascade', sourceKey: 'id'})
        zones.hasMany(models.rooms, {foreignKey: 'zone_id', as: 'rooms', onUpdate: 'cascade', sourceKey: 'id'})
    }

    return zones
}
