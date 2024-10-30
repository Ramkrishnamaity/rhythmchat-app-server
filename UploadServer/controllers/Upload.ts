import { Request, Response } from "express";
import { Res } from "../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../lib/utils/ResponseCode";
import { fileSupportedFormat, storySupportedFormat } from "../../lib/utils";
import { FileUploadResponce, VideoUploadResponce } from "../../lib/types/Responses/User/Upload";
import BucketUpload from "../../lib/utils/Bucket";

const fileUpload = async (req: Request, res: Response<Res<VideoUploadResponce | FileUploadResponce>>): Promise<void> => {
	try {
		if (req.file) {
			const type = req.file.mimetype.split("/")[0];
			if (fileSupportedFormat.includes(type)) {

				const data = (type === "video") ? await videoUp(req.file, req.User?._id ?? "") : await fileUp(req.file, req.User?._id ?? "");
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "File Uploaded Successfully.",
					data
				});

			} else {
				res.status(ResponseCode.BAD_REQUEST).json({
					status: false,
					message: "File Not Supported."
				});
			}
		} else {
			res.status(ResponseCode.NOT_FOUND_ERROR).json({
				status: false,
				message: "File Not Found."
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

const storyUpload = async (req: Request, res: Response<Res<VideoUploadResponce | FileUploadResponce>>): Promise<void> => {
	try {
		if (req.file) {
			const type = req.file.mimetype.split("/")[0];
			if (storySupportedFormat.includes(type)) {
				const data = (type === "video") ? await videoUp(req.file, req.User?._id ?? "") : await fileUp(req.file, req.User?._id ?? "");
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "File Uploaded Successfully.",
					data
				});
			} else {
				res.status(ResponseCode.BAD_REQUEST).json({
					status: false,
					message: "File Not Supported."
				});
			}
		} else {
			res.status(ResponseCode.NOT_FOUND_ERROR).json({
				status: false,
				message: "File Not Found."
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

async function fileUp(file: Express.Multer.File, _id: string): Promise<FileUploadResponce> {
	try {
		const type = file.mimetype.split("/");
		const fileName = `${Date.now()}.${type[1]}`;
		const directory = `rhythmchat/${_id}/${type[0]}/${fileName}`;

		await BucketUpload.pushOnBucket(file, directory);

		const url = `${process.env.DIGITALOCEAN_SPACES_URL}/${directory}`;

		return {
			url
		};
	} catch (error) {
		throw error;
	}
}

async function videoUp(file: Express.Multer.File, _id: string): Promise<VideoUploadResponce> {
	return {
		thumbnail: "",
		url: ""
	};
}

async function storyUp(file: Express.Multer.File, _id: string): Promise<VideoUploadResponce> {
	return {
		thumbnail: "",
		url: ""
	};
}

const UploadController = {
	fileUpload,
	storyUpload
};

export default UploadController;