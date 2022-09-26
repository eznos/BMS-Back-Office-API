const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const accommodations = sequelize.define(
        "accommodations",
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
            host: {
                type: Sequelize.BOOLEAN,
                field: "host",
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                field: "deleted",
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
            tableName: "accommodations",
        }
    );

    return accommodations;
};
