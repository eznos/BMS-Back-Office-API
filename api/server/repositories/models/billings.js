const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const billings = sequelize.define(
        "billings",
        {
            id: {
                unique: true,
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "id",
                comment: "ไอดีของตาราง",
            },
            billingType: {
                type: Sequelize.ENUM,
                values: ["electricity", "water"],
                field: "billing_type",
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM,
                values: ["draft", "in_progess", "calculated", "exported"],
                field: "status",
                allowNull: false,
            },
            unit: {
                type: Sequelize.INTEGER,
                field: "unit",
            },
            price: {
                type: Sequelize.FLOAT,
                field: "price",
            },
            priceDiff: {
                type: Sequelize.FLOAT,
                field: "price_diff",
            },
            totalPay: {
                type: Sequelize.FLOAT,
                field: "total_pay",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                field: "created_at",
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                field: "updated_at",
            },
        },
        {
            tableName: "billings",
        }
    );

    return billings;
};
