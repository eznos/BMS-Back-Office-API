const { DataTypes } = require("sequelize");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users",{
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
                indexes: [{ unique: true, fields: ["username", "email"] }],
            }
        );
        await queryInterface.createTable("accommodations", {
            id: {
                unique: true,
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "id",
                comment: "ไอดีของตาราง",
            },
            roomId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "room_id",
            },
            userId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "user_id",
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
        });
        await queryInterface.createTable("billings", {
            id: {
                unique: true,
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "id",
                comment: "ไอดีของตาราง",
            },
            billingType: {
                type: DataTypes.ENUM,
                values: ["electricity", "water"],
                field: "billing_type",
                allowNull: false,
            },
            accommodationId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                field: "accommodation_id",
                comment: "ไอดีของตารางaccommodation ที่เป็นคีย์นอก",
            },
            status: {
                type: DataTypes.ENUM,
                values: ["draft", "in_progess", "calculated", "exported"],
                field: "status",
                allowNull: false,
            },
            unit: {
                type: DataTypes.INTEGER,
                field: "unit",
            },
            price: {
                type: DataTypes.FLOAT,
                field: "price",
            },
            priceDiff: {
                type: DataTypes.FLOAT,
                field: "price_diff",
            },
            totalPay: {
                type: DataTypes.FLOAT,
                field: "total_pay",
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
        });
        await queryInterface.createTable("zones",{
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
                indexes: [{ unique: true, fields: ["name"] }],
            }
        );
        await queryInterface.createTable("water_zones",{
                id: {
                    unique: true,
                    allowNull: false,
                    primaryKey: true,
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "id",
                    comment: "ไอดีของตาราง",
                },
                zoneId: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "zone_id",
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
                indexes: [{ unique: true, fields: ["name"] }],
            }
        );
        await queryInterface.createTable("buildings",{
                id: {
                    unique: true,
                    allowNull: false,
                    primaryKey: true,
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "id",
                    comment: "ไอดีของตาราง",
                },
                zoneId: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "zone_id",
                },
                waterZoneId: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "water_zone_id",
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
                indexes: [{ unique: true, fields: ["name"] }],
            }
        );
        await queryInterface.createTable("rooms",{
                id: {
                    unique: true,
                    allowNull: false,
                    primaryKey: true,
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "id",
                    comment: "ไอดีของตาราง",
                },
                zoneId: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "zone_id",
                },
                waterZoneId: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "water_zone_id",
                },
                buildingId: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    field: "building_id",
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
                indexes: [{ unique: true, fields: ["roomNo"] }],
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropAllTables();
        await queryInterface.removeIndex("users", ["username", "email"]);
        await queryInterface.removeIndex("rooms", [
            "roomNo",
            "electricityNo",
            "electricityMeterNo",
            "waterNo",
            "waterMeterNo",
        ]);
        await queryInterface.dropAllEnums();
    },
};
