const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	const users = sequelize.define(
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
					'ร.ต.ต',
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
			sequelize,
			modelName: 'users',
			tableName: 'users',
			timestamps: true,
		}
	);

	users.associate = (models) => {
		users.hasMany(models.accommodations, {
			foreignKey: { name: 'userId', field: 'user_id' },
		});
	};

	return users;
};
