import { Request, Response } from "express";
import { Res } from "../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../lib/utils/ResponseCode";
import { fileSupportedFormat, storySupportedFormat } from "../../lib/utils";
import { FileUploadResponce, VideoUploadResponce } from "../../lib/types/Responses/User/Upload";
import BucketUpload from "../../lib/utils/Bucket";
import ffmpeg from "fluent-ffmpeg"
import fs from 'fs'

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

async function generateThumbnail(file: Express.Multer.File, dest: string) {
	return new Promise((resolve, reject) => {
		ffmpeg(file.path)
			.thumbnail({
				timestamps: ["10%"],
				filename: `/transcodes/${dest}`,
			})
			.on("end", resolve)
			.on("error", reject)
	})
}

async function fileUp(file: Express.Multer.File, _id: string): Promise<FileUploadResponce> {
	try {
		const type = file.mimetype.split("/");
		const fileName = `${Date.now()}_${file.originalname}`;
		const directory = `rhythmchat/${_id}/${type[0]}/${fileName}`;

		await BucketUpload.pushOnBucket(directory, file);

		const url = `${process.env.S3_URL}/${directory}`;

		return {
			url
		};

	} catch (error) {
		throw error;
	}
}

async function videoUp(file: Express.Multer.File, _id: string): Promise<VideoUploadResponce> {
	try {
		const thumbnailName = `thumbnail_${Date.now()}.png`

		await generateThumbnail(file, thumbnailName)

		const fileName = `${Date.now()}_${file.originalname}`;
		const thumbnailDirectory = `rhythmchat/${_id}/image/${thumbnailName}`;
		const fileDirectory = `rhythmchat/${_id}/video/${fileName}`;

		await BucketUpload.pushOnBucket(thumbnailDirectory, undefined, `./transcodes/${thumbnailName}`);
		await BucketUpload.pushOnBucket(fileDirectory, file);

		return {
			thumbnail: `${process.env.S3_URL}/${thumbnailDirectory}`,
			url: `${process.env.S3_URL}/${fileDirectory}`
		};
	} catch (error) {
		console.log("Error in Genarating Thumbnail: ", error)
		throw error
	}
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