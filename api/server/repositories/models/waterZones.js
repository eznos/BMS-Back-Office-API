const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const waterZones = sequelize.define(
        "waterZones",
        {
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
                type: Sequelize.STRING,
                allowNull: false,
                field: "name",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: DataTypes.NOW,
                field: "created_at",
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: DataTypes.NOW,
                field: "updated_at",
            },
        },
        {
            sequelize,
            modelName: "waterZones",
            tableName: "water_zones",
            timestamps: true,
        }
    );

    waterZones.associate = (models) => {
        waterZones.hasMany(models.rooms, { foreignKey: { name: "waterZoneId", field: "water_zone_id" } });
        waterZones.hasMany(models.buildings, { foreignKey: { name: "waterZoneId", field: "water_zone_id" } });
        waterZones.belongsTo(models.zones, { foreignKey: { name: "zoneId", field: "zone_id" } });
    };

    return waterZones;
};
