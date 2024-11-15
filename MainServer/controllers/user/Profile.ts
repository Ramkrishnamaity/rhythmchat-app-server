import { Request, Response } from "express";
import { CommonParamsType, Res } from "../../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";
import UserModel from "../../../models/User";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { AnotherProfileResponceType, GroupProfileResponceType, ProfileResponceType } from "../../../lib/types/Responses/User";
import { ResetPasswordParamsType, ResetPasswordRequestType, ResetPasswordType, UpdatePasswordRequestType, UpdateProfileRequestType } from "../../../lib/types/Requests/User/Profile";
import generateToken, { InputValidator, MailSender } from "../../../lib/utils";
import { JwtPayload, verify } from "jsonwebtoken";
import BucketUpload from "../../../lib/utils/Bucket";
import ConversationModel from "../../../models/Conversation";

const getUserProfile = async (req: Request, res: Response<Res<ProfileResponceType>>): Promise<void> => {
	try {

		const userData = await UserModel.aggregate([
			{
				$match: {
					_id: new Types.ObjectId(req.User?._id)
				}
			},
			{
				$project: {
					password: 0,
					createdOn: 0,
					isDeleted: 0,
					__v: 0
				}
			}
		]);

		userData.length !== 0 ?
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				message: "User Profile Fetched Successfully",
				data: userData[0]
			}) :
			res.status(ResponseCode.NOT_FOUND_ERROR).json({
				status: false,
				message: ResponseMessage.NOT_FOUND_ERROR
			});

	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const getAnotherProfile = (req: Request<CommonParamsType, any, any, { isGroup: string }>, res: Response<Res<AnotherProfileResponceType | GroupProfileResponceType>>): void => {
	try {
		InputValidator({ ...req.params, ...req.query }, {
			id: "required",
			isGroup: "required"
		}).then(async () => {

			let infoData = []
			if (JSON.parse(req.query.isGroup)) {

				infoData = await ConversationModel.aggregate([
					{
						$match: {
							_id: new Types.ObjectId(req.params.id)
						}
					},
					{
						$lookup: {
							from: "members",
							foreignField: "groupId",
							localField: "_id",
							as: "members",
							pipeline: [
								{
									$lookup: {
										from: "users",
										foreignField: "_id",
										localField: "userId",
										as: "user"
									}
								},
								{
									$unwind: {
										path: "$user",
										preserveNullAndEmptyArrays: false
									}
								},
								{
									$lookup: {
										from: "notifications",
										as: "requests",
										let: { userId: "$userId" },
										pipeline: [
											{
												$match: {
													$or: [
														{
															senderId: new Types.ObjectId(req.User?._id),
															$expr: {
																$eq: ["$receiverId", "$$userId"]
															}
														},
														{
															$expr: {
																$eq: ["$senderId", "$$userId"]
															},
															receiverId: new Types.ObjectId(req.User?._id)
														}
													]

												}
											},
											{
												$project: {
													isAccepted: 1,
													_id: 0
												}
											}
										]
									}
								},
								{
									$addFields: {
										isFriend: {
											$cond: [
												{ $eq: [{ $size: "$requests" }, 0] },
												false,
												{ $eq: [{ $arrayElemAt: ["$requests.isAccepted", 0] }, true] }
											]
										}
									}
								},
								{
									$project: {
										type: 1,
										userId: 1,
										firstName: "$user.firstName",
										lastName: "$user.lastName",
										image: "$user.image",
										isFriend: 1,
										createdOn: 1
									}
								},
								{
									$sort: {
										createdOn: 1
									}
								}
							]
						}
					},
					{
						$project: {
							_id: 0,
							name: 1,
							image: 1,
							description: 1,
							members: 1,
							totalMembers: {
								$size: "$members"
							},
							createdOn: 1
						}
					}
				]);

			} else {

				infoData = await UserModel.aggregate([
					{
						$match: {
							_id: new Types.ObjectId(req.params.id)
						}
					},
					{
						$project: {
							firstName: 1,
							lastName: 1,
							about: 1,
							image: 1,
							email: 1
						}
					}
				]);
			}

			infoData.length !== 0 ?
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Info Fetched Successfully",
					data: infoData[0]
				}) :
				res.status(ResponseCode.NOT_FOUND_ERROR).json({
					status: false,
					message: ResponseMessage.NOT_FOUND_ERROR
				});


		}).catch(error => {
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

const updateProfile = async (req: Request<any, any, UpdateProfileRequestType>, res: Response<Res<ProfileResponceType>>): Promise<void> => {
	try {

		if (req.body.image) {
			// delete its previous dp from cloud
			const profile = await UserModel.findById(req.User?._id);
			if (profile?.image !== "http://localhost:4060/assets/profile.png") {
				const directory = profile?.image.split(`${process.env.DIGITALOCEAN_SPACES_URL}/`)[1];
				directory && await BucketUpload.pullFromBucket(directory);
			}
		}

		const profile = await UserModel.findByIdAndUpdate(
			req.User?._id,
			{
				$set: { ...req.body, updatedOn: Date.now() }
			},
			{
				new: true,
				projection: {
					password: 0,
					createdOn: 0,
					isDeleted: 0,
					__v: 0
				}
			}
		);

		profile ?
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				message: "User Profile Updated Successfully",
				data: profile
			}) :
			res.status(ResponseCode.NOT_FOUND_ERROR).json({
				status: false,
				message: "Not Found!"
			});
	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const updatePassword = (req: Request<any, any, UpdatePasswordRequestType>, res: Response<Res<ProfileResponceType>>): void => {
	try {
		InputValidator(req.body, {
			oldPassword: "required",
			newPassword: "required"
		}).then(async () => {
			console.log(req.body);

			const user = await UserModel.findById(req.User?._id);
			if (bcrypt.compareSync(req.body.oldPassword, user?.password ?? "")) {

				const salt = bcrypt.genSaltSync(10);
				const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);

				await UserModel.findByIdAndUpdate(
					req.User?._id,
					{
						$set: {
							password: hashedPassword,
							updatedOn: Date.now()
						}
					}
				);

				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Password Updated Successfully",
				});
			} else {
				res.status(ResponseCode.SUCCESS).json({
					status: false,
					message: "Invalid Password."
				});
			}

		}).catch(error => {
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

const resetPasswordCheck = (req: Request<ResetPasswordParamsType>, res: Response<Res>): void => {
	try {
		InputValidator(req.params, {
			token: "required"
		}).then(async () => {

			try {

				const decrypted = verify(req.params.token, process.env.JWT_SECRET ?? "") as JwtPayload;
				const user = await UserModel.findById(decrypted._id)
				const data = {
					name: `${user?.firstName} ${user?.lastName}`,
				}
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Valid Link.",
					data
				});

			} catch (error) {
				res.status(ResponseCode.BAD_REQUEST).json({
					status: false,
					message: "Invalid Link!"
				});
			}

		}).catch(() => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: "Invalid Data!"
			});
		});

	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: "Server Error!",
			error
		});
	}
};

const resetPasswordRequest = (req: Request<any, any, ResetPasswordRequestType>, res: Response<Res>): void => {
	try {

		InputValidator(req.body, {
			email: "required"
		}).then(async () => {

			const user = await UserModel.findOne({ email: req.body.email });

			if (!user) {
				res.status(ResponseCode.NOT_FOUND_ERROR).json({
					status: false,
					message: "User not Found."
				});
			} else {

				const token = generateToken({ _id: user._id.toString() }, "5m");

				const url = `${process.env.CLIENT_BASE_URL}/reset-password/${token}`;

				await MailSender(user.email, 'Reset Password', `Reset your password from this link : ${url}`)

				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Check your registerd mail Id and Reset within 5 minutes."
				});

			}

		}).catch(error => {
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

const resetPassword = (req: Request<any, any, ResetPasswordType>, res: Response<Res>): void => {
	try {

		InputValidator(req.body, {
			password: "required",
			token: "required"
		}).then(async () => {

			try {
				const decrypted = verify(req.body.token, process.env.JWT_SECRET ?? "") as JwtPayload;

				const salt = bcrypt.genSaltSync(10);
				const hashedPassword = bcrypt.hashSync(req.body.password, salt);

				await UserModel.findByIdAndUpdate(
					decrypted._id,
					{
						$set: {
							password: hashedPassword,
							updatedOn: Date.now()
						}
					}
				);

				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Password Reset Done."
				});
			} catch (error) {
				res.status(ResponseCode.BAD_REQUEST).json({
					status: false,
					message: "Time Limit Exceeded!"
				});
			}

		}).catch((error) => {
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

const deleteAccount = async (req: Request, res: Response<Res>): Promise<void> => {
	try {

		//remove user folder in bucket

		//clear user's chat history

		//clear user's call history

		//clear user's story doc and favorite chat doc

		//delete user's profile

		res.status(ResponseCode.SUCCESS).json({
			status: true,
			message: "Acount Deleted Successfully"
		});
	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const updateDeviceToken = async (req: Request<CommonParamsType>, res: Response<Res>): Promise<void> => {
	try {
		if (req.params.id) {
			await UserModel.findByIdAndUpdate(
				req.User?._id,
				{
					$set: {
						deviceToken: req.params.id
					}
				}
			);

			res.status(ResponseCode.SUCCESS).json({
				status: true,
				message: "User Token Updated Successfully"
			});
		} else {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: ResponseMessage.VALIDATION_ERROR
			});
		}
	} catch (error) {
		res.status(ResponseCode.SERVER_ERROR).json({
			status: false,
			message: ResponseMessage.SERVER_ERROR,
			error
		});
	}
};

const UserProfileController = {
	getUserProfile,
	getAnotherProfile,
	updateProfile,
	updateDeviceToken,
	updatePassword,
	resetPasswordRequest,
	resetPassword,
	resetPasswordCheck,
	deleteAccount
};

export default UserProfileController;