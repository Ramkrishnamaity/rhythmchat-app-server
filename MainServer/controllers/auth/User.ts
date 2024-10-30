import { Request, Response } from "express";
import { Res } from "../../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";
import { LoginRequestType, OtpRequestType, RegisterRequestType } from "../../../lib/types/Requests/Auth/User";
import generateToken, { InputValidator, MailSender } from "../../../lib/utils";
import { UserLoginResponse } from "../../../lib/types/Responses/Auth/User";
import UserModel from "../../../models/User";
import bcrypt from "bcrypt";
import { generate } from "otp-generator";
import { redisCache } from "../../../lib/config/Database";
import OtpModel from "../../../models/Otp";

const login = async (req: Request<any, any, LoginRequestType>, res: Response<Res<UserLoginResponse>>): Promise<void> => {
	try {

		InputValidator(req.body, {
			email: "required",
			password: "required"
		})
			.then(async () => {

				const user = await UserModel.findOne(
					{ email: req.body.email },
					{
						createdOn: 0,
						isDeleted: 0,
						__v: 0
					}
				);

				if (!user) {
					res.status(ResponseCode.BAD_REQUEST).json({
						status: false,
						message: "User not Found."
					});
				} else {

					if (!bcrypt.compareSync(req.body.password, user.password ?? "")) {

						res.status(ResponseCode.AUTH_ERROR).json({
							status: false,
							message: "Incorrect Password or User."
						});

					} else {

						const token = generateToken({ _id: user._id.toString() });

						// push in redis cache
						await redisCache.set(`user:${user._id}:token`, token);
						await redisCache.set(token, user._id.toString());

						user.password = undefined;

						res.status(ResponseCode.SUCCESS).json({
							status: true,
							message: "User Logged in Successfully",
							data: {
								token,
								profile: user
							}
						});

					}

				}

			})
			.catch(error => {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: ResponseMessage.VALIDATION_ERROR,
					error
				});
			});

	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const register = (req: Request<any, any, RegisterRequestType>, res: Response<Res>): void => {
	try {

		InputValidator(req.body, {
			email: "required",
			password: "required",
			otp: "required",
			firstName: "required",
			lastName: "required"
		})
			.then(async () => {

				const isExist = await UserModel.findOne({ email: req.body.email });
				if (isExist) {

					res.status(ResponseCode.BAD_REQUEST).json({
						status: false,
						message: "User Already Registered."
					});

				} else {
					const otpInDoc = await OtpModel.findOne({ email: req.body.email });
					if (!otpInDoc || (otpInDoc.otp !== req.body.otp)) {
						res.status(ResponseCode.NOT_FOUND_ERROR).json({
							status: false,
							message: "Invalid Otp."
						});
					} else {
						const salt = bcrypt.genSaltSync(10);
						const hashedPassword = bcrypt.hashSync(req.body.password, salt);

						const user = await UserModel.create({
							...req.body,
							password: hashedPassword
						});

						res.status(ResponseCode.SUCCESS).json({
							status: true,
							message: "User Registered Successfully"
						});
					}
				}

			})
			.catch(error => {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: ResponseMessage.VALIDATION_ERROR,
					error
				});
			});

	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const sendOtp = (req: Request<any, any, OtpRequestType>, res: Response<Res>): void => {
	try {
		InputValidator(req.body, {
			email: "required"
		})
			.then(async () => {

				const isExist = await UserModel.findOne({ email: req.body.email });
				if (isExist) {

					res.status(ResponseCode.BAD_REQUEST).json({
						status: false,
						message: "User Already Registered."
					});

				} else {

					const otp = generate(6, {
						upperCaseAlphabets: false,
						lowerCaseAlphabets: false,
						specialChars: false
					});
					if (!await MailSender(req.body.email, "SignUp Verification", `Your Otp is ${otp}`)) {
						res.status(ResponseCode.SERVER_ERROR).json({
							status: false,
							message: ResponseMessage.SERVER_ERROR
						});
					} else {

						await OtpModel.findOneAndUpdate(
							{
								email: req.body.email
							},
							{
								$set: {
									otp
								}
							},
							{ upsert: true }
						);

						res.status(ResponseCode.SUCCESS).json({
							status: true,
							message: "Otp Sent Successfully."
						});
					}
				}
			})
			.catch((error) => {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: ResponseMessage.VALIDATION_ERROR,
					error
				});
			});
	} catch (error) {
		console.log(error, "error");
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const UserAuthController = {
	login,
	register,
	sendOtp
};

export default UserAuthController;
