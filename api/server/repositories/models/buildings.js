const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
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
                type: Sequelize.STRING,
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
            tableName: "buildings",
        }
    );

    return buildings;
};
