const moment = require("moment");
const _ = require("lodash");
const User = require("../models/user");
const query = require("../models/query");
const { ObjectId, signToken, equalObj, sendEmail, tokenDetails } = require("../helpers/functions");
var axios = require("axios").default;

module.exports = {
	signUp: async (req, res, next) => {
		const { username, email, password } = req.body;
		try {
			let eUser = await User.findOne({ $or: [{ email: email }, { username: username }] })
				.select("_id email username")
				.lean();
			if (eUser) {
				eUser = _.omit(eUser, "_id");
				let errKeys = Object.keys(equalObj(eUser, { username, email })),
					errorObj = {};
				errKeys.map((k) => {
					errorObj[k] = [{ message: `${k} already exists` }];
				});
				throw { statusCode: 400, errorObj, error: new Error() };
			} else {
				const nUser = new User({ username, email, password, confirmation: { confirm: false } });
				let ctoken = await signToken({ sub: nUser._id }, "web", "confirm");
				nUser.confirmation.code = ctoken;
				const savedUser = await nUser.save();
				return res.status(201).send(savedUser);
				
			}
		} catch (e) {
			console.log(e);

			Object.keys(e.errorObj).map((err) => {
				console.log(e.errorObj[err][0].message);
			});
			return res
				.status(e.statusCode)
				.send({
					success: false,
					statusCode: e.statusCode,
					message: "Account not created, due to following errors",
					errors: e.errorObj,
				});
		}
	},

	signIn: async (req, res, next) => {
		const { email, password } = req.body;
		try {
			const user = await User.findOne({ email: email });
			let unlock = false;
			if (!user)
				throw {
					success: false,
					statusCode: 401,
					errorObj: {},
					message: "Email not exists",
					error: new Error(),
				};
			if (user.locked.status == true) {
				let e = moment(user.locked.lockUntil),
					s = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
				if (e.diff(s, "hours") <= 1) unlock = true;
				else
					throw {
						success: false,
						statusCode: 401,
						errorObj: {},
						message: `account locked because of invalid login attempts wait ${e.diff(
							s,
							"hours"
						)}h to continue`,
						error: new Error(),
					};
			}
			const isMatch = await user.isValidPassword(password);
			if (!isMatch && unlock) {
				let rAttempts = process.env.MaxLoginAttempts;
				let update = {
					$set: {
						"locked.status": false,
						"locked.lockType": "",
						"locked.lockUntil": null,
						"failedLogin.attempt": 1,
						"failedLogin.incorrect": 1,
					},
				};
				await User.findOneAndUpdate({ _id: ObjectId(user._id) }, update, { upsert: true });
				throw {
					success: false,
					statusCode: 401,
					errorObj: {},
					message: `Either Email or Password is incorrect, remaining attempts : ${rAttempts}`,
					attempts: [{ message: "remaining attempts :" + rAttempts }, { count: rAttempts }],
					error: new Error(),
				};
			} else if (!isMatch) {
				let rAttempts = process.env.MaxLoginAttempts - user.failedLogin.attempt;
				let lUser = rAttempts == 1 ? true : false;
				let lockUntil = moment(new Date()).add(process.env.LockUntil, "hours").format("YYYY-MM-DD hh:mm:ss");
				let update = {
					$set: {
						"locked.status": lUser ? true : false,
						"locked.lockType": lUser ? "maxLoginattempts" : "",
						"locked.lockUntil": lUser ? lockUntil : null,
					},
					$inc: { "failedLogin.attempt": 1, "failedLogin.incorrect": 1 },
				};
				await User.findOneAndUpdate({ _id: ObjectId(user._id) }, update, { upsert: true });
				throw {
					success: false,
					statusCode: 401,
					errorObj: {},
					message: `Either Email or Password is incorrect, remaining attempts : ${rAttempts}`,
					attempts: [{ message: "remaining attempts :" + rAttempts }, { count: rAttempts }],
					error: new Error(),
				};
			} else {
				/* if (user.confirmation.confirm == false)
					throw {
						success: false,
						statusCode: 422,
						errorObj: {},
						message: "Account not confirmed ",
						error: new Error(),
					}; */
				//todo determinse useragent
				signToken({ sub: user._id }, "web", "login")
					.then(async (token) => {
						updated = await User.findOneAndUpdate(
							{ _id: ObjectId(user._id) },
							{ $set: { "failedLogin.attempt": 0, "failedLogin.incorrect": 0 } },
							{ upsert: true }
						).select("-_id -__v -password -locked -failedLogin -confirmation ");
						//user.token = token;
						return res
							.status(200)
							.send({
								success: true,
								statusCode: 200,
								message: "Operation Successfull",
								user: updated,
								token,
								user_id: user._id,
							});
					})
					.catch((e) => {
						return res
							.status(400)
							.send({
								success: false,
								statusCode: 400,
								message: "Something went wrong please try again",
							});
					});
			}
		} catch (e) {
			console.log(e);
			return res
				.status(e.statusCode || 400)
				.send({
					success: false,
					statusCode: e.statusCode || 400,
					message: e.message,
					attempts: e.attempts,
					errors: e.errorObj || {},
				});
		}
	},

	contactList: async (req, res, next) => {
		const { uid } = req.body;
		let { sub } = await tokenDetails(req.headers.authorization);
		User.findOne({ _id: ObjectId(sub) })
			.select("-_id contacts")
			.lean()
			.then(async (r) => {
				if (r.length <= 0)
					return res
						.status(200)
						.send({ success: true, statusCode: 200, message: "Operation Successful", contacts: [] });
				let contacts = await User.find({ _id: { $in: r.contacts } }).select("username email");
				return res
					.status(200)
					.send({ success: true, statusCode: 200, message: "Operation Successful", contacts });
			})
			.catch((e) => {
				return res
					.status(400)
					.send({ success: false, statusCode: 400, message: e.message, errors: e.errorObj || {} });
			});
	},
	fetchRestaurant: async (req, res, next) => {
		const { lat, lan, distance, page, fullmenu, cuisine, top_cuisines, size } = req.body;
		let { sub } = await tokenDetails(req.headers.authorization);
		const queryHistory = new query({ from: ObjectId(sub), lat: lat, lon: lan });
		var results = await queryHistory.save();
		console.log(results);

		var options = {
			method: "GET",
			url:
				"https://api.documenu.com/v2/restaurants/search/geo?lat=" +
				lat +
				"&lon=" +
				lan +
				"&distance=1&fullmenu=false&size=10&page=1",
			headers: {
				"x-api-key": "3e49dd1bd55faa9a74bea3b58031870b",
				"x-rapidapi-key": "acb42b1b3bmsh22cff0eee3fc650p11a8f7jsnf44fe5d310d3",
				"x-rapidapi-host": "documenu.p.rapidapi.com",
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};

		axios
			.request(options)
			.then(function (response) {
				console.log(response.data);
				return res
					.status(200)
					.send({ success: true, statusCode: 200, message: "Operation Successful", data: response.data });
			})
			.catch(function (e) {
				return res
					.status(400)
					.send({ success: false, statusCode: 400, message: e.message, errors: e.errorObj || {} });
			});
	},

	historyList: async (req, res, next) => {
		const { uid } = req.body;
		let { sub } = await tokenDetails(req.headers.authorization);
		query
			.find({ from: ObjectId(sub) })
			.select("lat lon")
			.then(async (r) => {
				return res.status(200).send({ success: true, statusCode: 200, message: "Operation Successful", r });
			})
			.catch((e) => {
				return res
					.status(400)
					.send({ success: false, statusCode: 400, message: e.message, errors: e.errorObj || {} });
			});
	}
};
