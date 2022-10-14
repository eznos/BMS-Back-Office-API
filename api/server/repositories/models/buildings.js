const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const buildings = sequelize.define(
        "buildings",
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
        },
        {
            sequelize,
            modelName: "buildings",
            tableName: "buildings",
            timestamps: true,
        }
    );

    buildings.associate = (models) => {
        buildings.hasMany(models.rooms, { foreignKey: { name: "buildingID", field: "building_id" } });
        buildings.belongsTo(models.zones, { foreignKey: { name: "zoneId", field: "zone_id" } });
        buildings.belongsTo(models.waterZones, { foreignKey: { name: "waterZoneId", field: "water_zone_id" } });
    };

    return buildings;
};
