const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const water_zones = sequelize.define(
        "water_zones",
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
            tableName: "water_zones",
        }
    );

    return water_zones;
};
