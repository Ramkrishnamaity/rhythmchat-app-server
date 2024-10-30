import { Request, Response } from "express";
import { CommonParamsType, Res } from "../../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";
import UserModel from "../../../models/User";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { ProfileResponceType } from "../../../lib/types/Responses/User";
import { ChangePasswordRequestType, ResetPasswordParamsType, ResetPasswordRequestType, UpdatePasswordRequestType, UpdateProfileRequestType } from "../../../lib/types/Requests/User/Profile";
import generateToken, { InputValidator, MailSender } from "../../../lib/utils";
import { verify, JwtPayload } from "jsonwebtoken";
import BucketUpload from "../../../lib/utils/Bucket";

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

const updateProfile = async (req: Request<any, any, UpdateProfileRequestType>, res: Response<Res<ProfileResponceType>>): Promise<void> => {
	try {

		if (req.body.image) {
			// delete its previous dp from cloud
			const profile = await UserModel.findById(req.User?._id);
			if (profile?.image !== "http://127.0.0.1:4050/api/v1/uploads/profile.png") {
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

		profile?
		res.status(ResponseCode.SUCCESS).json({
			status: true,
			message: "User Profile Updated Successfully",
			data: profile
		}):
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

const changePassword = (req: Request<{ id: string }, any, ChangePasswordRequestType>, res: Response<Res<ProfileResponceType>>): void => {
	try {
		InputValidator({ ...req.body, ...req.params }, {
			password: "required",
			confirmPassword: "required",
			id: "required"
		}).then(async () => {

			const { confirmPassword, password } = req.body;
			if (password !== confirmPassword) res.redirect("/api/v1/message/Password does't match try again");
			else {

				const salt = bcrypt.genSaltSync(10);
				const hashedPassword = bcrypt.hashSync(password, salt);

				await UserModel.findByIdAndUpdate(
					req.params.id,
					{
						$set: {
							password: hashedPassword,
							updatedOn: Date.now()
						}
					}
				);

				res.redirect("/api/v1/message/Password Successfully Reset.");
			}

		}).catch(() => {
			res.redirect("/api/v1/message/Please fill all fields");
		});

	} catch (error) {
		console.log(error);
		res.redirect("/api/v1/message/Server error, try again.");
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

				const token = generateToken({ _id: user._id.toString() }, "1d");

				const url = `${process.env.SERVER_BASE_URL}/api/v1/user/reset-password/${user._id}/${token}`;
				console.log(url);

				// await MailSender(user.email, 'Reset Password', `Reset your password from this link : ${url}`)

				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Please reset your password from your registerd mail Id."
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

const resetPassword = (req: Request<ResetPasswordParamsType>, res: Response<Res>): void => {
	try {

		InputValidator(req.params, {
			id: "required",
			token: "required"
		}).then(async () => {

			console.log(req.body);

			const user = await UserModel.findById(req.params.id);
			if (!user) {
				res.redirect("/api/v1/message/User Not Found.");
			} else {
				try {
					const decrypted = verify(req.params.token, process.env.JWT_SECRET ?? "") as JwtPayload;
					if (decrypted._id !== req.params.id) {
						res.redirect("/api/v1/message/Invalid Url.");
					} else {
						res.render("ResetPassword", { name: `${user.firstName}`, id: user._id });
					}
				} catch (error) {
					res.redirect("/api/v1/message/Time Exceeded, Try again.");
				}
			}

		}).catch((error) => {
			console.log(error);
			res.redirect("/api/v1/message/Invalid Url.");
		});

	} catch (error) {
		console.log(error);
		res.redirect("/api/v1/message/Server Error.");
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
			const profile = await UserModel.findByIdAndUpdate(
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
	updateProfile,
	updateDeviceToken,
	updatePassword,
	resetPasswordRequest,
	resetPassword,
	changePassword,
	deleteAccount
};

export default UserProfileController;