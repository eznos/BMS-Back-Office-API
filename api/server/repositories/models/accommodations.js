const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
                type: DataTypes.BOOLEAN,
                field: "host",
            },
            deleted: {
                type: DataTypes.BOOLEAN,
                field: "deleted",
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
            modelName: "accommodations",
            tableName: "accommodations",
            timestamps: true,
        }
    );

    accommodations.associate = (models) => {
        accommodations.hasMany(models.billings, { foreignKey: { name: "accommodationId", field: "accommodation_id" } });
        accommodations.belongsTo(models.users, { foreignKey: { name: "userId", field: "user_id" } });
        accommodations.belongsTo(models.rooms, { foreignKey: { name: "roomId", field: "room_id" } });
    };

    return accommodations;
};
