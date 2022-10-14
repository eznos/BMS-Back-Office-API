const { DataTypes, Deferrable } = require('sequelize');

module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			'users',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				username: {
					allowNull: false,
					type: DataTypes.STRING,
					field: 'username',
				},
				password: {
					allowNull: false,
					type: DataTypes.STRING,
					field: 'password',
				},
				otpSecret: {
					type: DataTypes.STRING,
					field: 'otp_secret',
				},
				role: {
					allowNull: false,
					type: DataTypes.ENUM,
					values: ['admin', 'user'],
					field: 'role',
				},
				rank: {
					type: DataTypes.ENUM,
					values: [
						'n/a',
						'พล.ต.อ.',
						'พล.ต.ท.',
						'พล.ต.ต.',
						'พ.ต.อ.',
						'พ.ต.ท.',
						'พ.ต.ต.',
						'ร.ต.อ.',
						'ร.ต.ท.',
						'ร.ต.ต.',
						'ด.ต.',
						'จ.ส.ต.',
						'ส.ต.อ.',
						'ส.ต.ท.',
						'ส.ต.ต.',
					],
					field: 'rank',
				},
				affiliation: {
					type: DataTypes.ENUM,
					values: [
						'n/a',
						'ผบช.ภ.3',
						'สนง.ผบช.ภ.3',
						'สนง.รอง ผบช.ภ.3',
						'ภ.3(ส่วนกลาง)',
						'บก.สส.ภ.3',
						'ภ.จว.นม.',
						'สภ.เมืองนครราชสีมา',
						'บก.อก.ภ.3',
						'ศพฐ.3',
						'ปฏิบัติราชการ',
						'ประจำ',
						'สำรอง',
						'ภ.3',
						'ศฝร.ภ.3',
					],
					field: 'affiliation',
				},
				firstName: {
					type: DataTypes.STRING,
					field: 'first_name',
				},
				lastName: {
					type: DataTypes.STRING,
					field: 'last_name',
				},
				gender: {
					type: DataTypes.ENUM,
					values: ['n/a', 'male', 'female'],
					field: 'gender',
				},
				email: {
					unique: true,
					type: DataTypes.STRING,
					field: 'email',
				},
				phoneNumber: {
					type: DataTypes.STRING,
					field: 'phone_number',
				},
				profileUrl: {
					type: DataTypes.STRING,
					field: 'profile_url',
				},
				deleted: {
					type: DataTypes.BOOLEAN,
					field: 'deleted',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [{ unique: true, fields: ['username', 'email'] }],
			}
		);
		await queryInterface.createTable(
			'zones',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				name: {
					unique: true,
					type: DataTypes.STRING,
					allowNull: false,
					field: 'name',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [{ fields: ['name'] }],
			}
		);
		await queryInterface.createTable(
			'water_zones',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				zoneId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'zone_id',
					references: {
						model: 'zones',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				name: {
					unique: true,
					type: DataTypes.STRING,
					allowNull: false,
					field: 'name',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [{ fields: ['zone_id', 'name'] }],
			}
		);
		await queryInterface.createTable(
			'buildings',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				zoneId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'zone_id',
					references: {
						model: 'zones',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				waterZoneId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'water_zone_id',
					references: {
						model: 'water_zones',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false,
					field: 'name',
					unique: true,
				},
				imageUrl: {
					type: DataTypes.STRING,
					field: 'image_url',
				},
				lat: {
					type: DataTypes.DOUBLE,
					field: 'lat',
				},
				lng: {
					type: DataTypes.DOUBLE,
					field: 'lng',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [{ fields: ['zone_id', 'water_zone_id', 'name'] }],
			}
		);
		await queryInterface.createTable(
			'rooms',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				zoneId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'zone_id',
					references: {
						model: 'zones',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				waterZoneId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'water_zone_id',
					references: {
						model: 'water_zones',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				buildingId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'building_id',
					references: {
						model: 'buildings',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				roomNo: {
					type: DataTypes.STRING,
					allowNull: false,
					field: 'room_no',
				},
				roomType: {
					type: DataTypes.ENUM,
					values: ['single', 'family_1', 'family_2'],
					field: 'room_type',
				},
				electricityNo: {
					unique: true,
					type: DataTypes.STRING,
					field: 'electricity_no',
				},
				electricityMeterNo: {
					unique: true,
					type: DataTypes.STRING,
					field: 'electricity_meter_no',
				},
				waterNo: {
					unique: true,
					type: DataTypes.STRING,
					field: 'water_no',
				},
				waterMeterNo: {
					unique: true,
					type: DataTypes.STRING,
					field: 'water_meter_no',
				},
				status: {
					type: DataTypes.ENUM,
					values: ['empty', 'not_empty'],
					field: 'status',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [
					{
						unique: true,
						fields: [
							'zone_id',
							'water_zone_id',
							'building_id',
							'room_no',
							'room_type',
							'electricity_no',
							'electricity_meter_no',
							'water_no',
							'water_meter_no',
							'status',
						],
					},
				],
			}
		);
		await queryInterface.createTable(
			'accommodations',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				roomId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'room_id',
					references: {
						model: 'rooms',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				userId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'user_id',
					references: {
						model: 'users',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				host: {
					type: DataTypes.BOOLEAN,
					field: 'host',
				},
				deleted: {
					type: DataTypes.BOOLEAN,
					field: 'deleted',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [{ fields: ['room_id', 'user_id', 'host'] }],
			}
		);
		await queryInterface.createTable(
			'billings',
			{
				id: {
					unique: true,
					allowNull: false,
					primaryKey: true,
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'id',
					comment: 'ไอดีของตาราง',
				},
				billingType: {
					type: DataTypes.ENUM,
					values: ['electricity', 'water'],
					field: 'billing_type',
					allowNull: false,
				},
				accommodationId: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					field: 'accommodation_id',
					comment: 'ไอดีของตาราง accommodation ที่เป็นคีย์นอก',
					references: {
						model: 'accommodations',
						key: 'id',
						deferrable: Deferrable.INITIALLY_IMMEDIATE,
					},
				},
				status: {
					type: DataTypes.ENUM,
					values: ['draft', 'in_progress', 'calculated', 'exported'],
					field: 'status',
					allowNull: false,
				},
				unit: {
					type: DataTypes.INTEGER,
					field: 'unit',
				},
				price: {
					type: DataTypes.FLOAT,
					field: 'price',
				},
				priceDiff: {
					type: DataTypes.FLOAT,
					field: 'price_diff',
				},
				totalPay: {
					type: DataTypes.FLOAT,
					field: 'total_pay',
				},
				createdAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'created_at',
				},
				updatedAt: {
					allowNull: false,
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
					field: 'updated_at',
				},
			},
			{
				indexes: [
					{
						fields: [
							'billing_type',
							'accommodation_id',
							'status',
							'created_at',
						],
					},
				],
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.dropAllTables();
		await queryInterface.removeIndex('users', ['username', 'email']);
		await queryInterface.removeIndex('zones', ['name']);
		await queryInterface.removeIndex('water_zones', ['zone_id', 'name']);
		await queryInterface.removeIndex('buildings', [
			'zone_id',
			'water_zone_id',
			'name',
		]);
		await queryInterface.removeIndex('rooms', [
			'roomNo',
			'electricityNo',
			'electricityMeterNo',
			'waterNo',
			'waterMeterNo',
		]);
		await queryInterface.removeIndex('accommodations', [
			'room_id',
			'user_id',
			'host',
		]);
		await queryInterface.removeIndex('billings', [
			'billing_type',
			'accommodation_id',
			'status',
			'createdAt',
		]);
		await queryInterface.dropAllEnums();
	},
};
