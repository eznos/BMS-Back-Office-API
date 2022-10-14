//importing modules
const bcrypt = require('bcrypt');
const db = require('../../server/repositories/models/index');
const jwt = require('jsonwebtoken');

// Assigning users to the variable User
// const User = db.users;
const {
	users /*accommodations, billings, buildings, rooms, waterZones, zones */,
} = db;
//signing a user up
//hashing users password before its saved to the database with bcrypt
const signup = async (req, res) => {
	try {
		const {
			username,
			password,
			otpSecret,
			role,
			rank,
			affiliation,
			firstName,
			lastName,
			gender,
			email,
			phoneNumber,
			profileUrl,
			deleted,
		} = req.body;
		const data = {
			username,
			password: await bcrypt.hash(password, 10),
			otpSecret,
			role,
			rank,
			affiliation,
			firstName,
			lastName,
			gender,
			email,
			phoneNumber,
			profileUrl,
			deleted,
		};
		//saving the user
		const user = await users.create(data);
		//if user details is captured
		//generate token with the user's id and the secretKey in the env file
		// set cookie with the token generated
		if (user) {
			let token = jwt.sign({ id: user.id }, process.env.secretKey, {
				expiresIn: 1 * 24 * 60 * 60 * 1000,
			});
			res.cookie('jwt', token, {
				maxAge: 1 * 24 * 60 * 60,
				httpOnly: true,
			});
			console.log('user', JSON.stringify(user, null, 2));
			console.log(token);
			//send users details
			return res.status(201).send(user);
		} else {
			return res.status(404).json({ status: 'signup', status_code: 409 });
			// res.status(409).send("Details are not correct");
		}
	} catch (error) {
		console.log(error);
	}
};

//login authentication

const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		//find a user by their username
		console.log(username);
		const user = await users.findOne({ where: { username: username } });
		console.log(user);
		//if user email is found, compare password with bcrypt
		if (user) {
			const isSame = await bcrypt.compare(password, user.password);
			//if password is the same
			//generate token with the user's id and the secretKey in the env file
			if (isSame) {
				let token = jwt.sign({ id: user.id }, process.env.secretKey, {
					expiresIn: 1 * 24 * 60 * 60 * 1000,
				});
				//if password matches wit the one in the database
				//go ahead and generate a cookie for the user
				res.cookie('jwt', token, {
					maxAge: 1 * 24 * 60 * 60,
					httpOnly: true,
				});
				console.log('user', JSON.stringify(user, null, 2));
				console.log(token);
				//send user data
				// return res.status(201).send(user);
				return res.status(200).json({
					status: 'success',
					status_code: 200,
					result: user,
				});
			} else {
				// console.log(token)
				return res.status(401).send('Authentication failed1');
			}
		} else {
			// return res.status(401).send("Authentication failed2");
			return res.status(401).json({
				status: 'unauthorized',
				status_code: 401,
				error_message: 'invalid username or password',
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const loginUser = async (req, res) => {
	res.status(200).json({
		status: 'success',
		status_code: 200,
		result: { role: 'user' },
	});
};

const logout = async (req, res) => {
	res.send(`logouted`);
	// console.log("what the fu*k");
};

const recoveryCode = async (req, res) => {
	try {
		const { recovery_code, type, password } = req.body;
		const email = req.params.email;
		const user = await users.findOne({ where: { email: email } });
		if (type == 'RESET') {
			if (user) {
				const findCode = await users.findOne({
					where: { otpSecret: recovery_code },
				});
				if (findCode) {
					const hashPassword = await bcrypt.hash(password, 10);
					const newpassword = await users.update(
						{ password: hashPassword },
						{ where: { email: req.params.email } }
					);
					if (newpassword) {
						return res
							.status(200)
							.json({ status: 'success', status_code: 200 });
					} else {
						return res.status(401).json({
							status: 'unauthorized',
							status_code: 422,
							error_message: "can't update password",
						});
					}
				} else {
					return res.status(422).json({
						status: 'unprocessable_entity',
						status_code: 422,
						error_message: 'invalid email',
					});
				}
			} else {
				return res.status(401).json({
					status: 'unprocessable_entity',
					status_code: 401,
					error_message: 'invalid email',
				});
			}
		} else {
			return res.status(401).json({
				status: 'unauthorized',
				status_code: 401,
				error_message: 'invalid API Key',
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const showUser = async (req, res) => {
	const allUser = await users.findAll({
		attributes: [
			'id',
			'role',
			'rank',
			'affiliation',
			'firstName',
			'lastName',
			'gender',
			'email',
			'phoneNumber',
		],
		where: {
			deleted: 'false',
		},
	});
	if (!allUser) {
		res.status(200).json({
			status: 'success',
			status_code: 200,
			result: allUser,
		});
	} else {
		res.status(200).json({
			status: 'success',
			status_code: 200,
			result: allUser,
		});
	}
};

module.exports = {
	signup,
	login,
	logout,
	loginUser,
	recoveryCode,
	showUser,
};
