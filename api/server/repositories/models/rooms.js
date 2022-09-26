const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = new Sequelize('sqlite::memory:');
module.exports = (sequelize, Sequelize) => {
    const rooms = sequelize.define(
        "rooms",
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
            roomNo: {
                type: Sequelize.STRING,
                allowNull: false,
                field: "room_no",
            },
            roomType: {
                type: DataTypes.ENUM,
                values: ["single", "family_1", "family_2"],
                field: "room_type",
            },
            electricityNo: {
                unique: true,
                type: Sequelize.STRING,
                field: "electricity_no",
            },
            electricityMeterNo: {
                unique: true,
                type: Sequelize.STRING,
                field: "electricity_meter_no",
            },
            waterNo: {
                unique: true,
                type: DataTypes.STRING,
                field: "water_no",
            },
            waterMeterNo: {
                unique: true,
                type: Sequelize.STRING,
                field: "water_meter_no",
            },
            status: {
                type: DataTypes.ENUM,
                values: ["empty", "not_empty"],
                field: "status",
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
            tableName: "rooms",
        }
    );

    return rooms;
};
