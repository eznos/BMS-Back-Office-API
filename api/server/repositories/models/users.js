const { DataTypes } = require("sequelize");
module.exports = (sequelize, Sequelize,) => {
    
    const users = sequelize.define(
        "users",
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
            username: {
                allowNull: false,
                type: Sequelize.STRING,
                field: "username",
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING,
                field: "password",
            },
            otpSecret: {
                type: Sequelize.STRING,
                field: "otp_secret",
            },
            role: {
                allowNull: false,
                type: DataTypes.ENUM,
                values: ["admin", "user"],
                field: "role",
            },
            rank: {
                type: DataTypes.ENUM,
                values: [
                    "n/a",
                    "พล.ต.ต.",
                    "พ.ต.อ.",
                    "พ.ต.ท.",
                    "พ.ต.ต.",
                    "ร.ต.อ.",
                    "ร.ต.ท.",
                    "ร.ต.ต.",
                    "ด.ต.",
                    "จ.ส.ต.",
                    "ส.ต.อ.",
                    "ส.ต.ท.",
                    "ส.ต.ต.",
                ],
                field: "rank",
            },
            affiliation: {
                type: DataTypes.ENUM,
                values: [
                    "n/a",
                    "ผบช.ภ.3",
                    "สนง.ผบช.ภ.3",
                    "สนง.รอง ผบช.ภ.3",
                    "ภ.3(ส่วนกลาง)",
                    "บก.สส.ภ.3",
                    "ภ.จว.นม.",
                    "สภ.เมืองนครราชสีมา",
                    "บก.อก.ภ.3",
                    "ศพฐ.3",
                    "ปฏิบัติราชการ",
                    "ประจำ",
                    "สำรอง",
                    "ภ.3",
                    "ศฝร.ภ.3",
                ],
                field: "affiliation",
            },
            firstName: {
                type: Sequelize.STRING,
                field: "first_name",
            },
            lastName: {
                type: Sequelize.STRING,
                field: "last_name",
            },
            gender: {
                type: DataTypes.ENUM,
                values: ["n/a", "male", "female"],
                field: "gender",
            },
            email: {
                unique: true,
                type: Sequelize.STRING,
                field: "email",
            },
            phoneNumber: {
                type: Sequelize.STRING,
                field: "phone_number",
            },
            profileUrl: {
                type: Sequelize.STRING,
                field: "profile_url",
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
            tableName: "users",
        }
    );

    return users;
};
