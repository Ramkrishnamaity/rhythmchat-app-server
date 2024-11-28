import { Request, Response } from "express";
import { Res } from "../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../lib/utils/ResponseCode";
import { fileSupportedFormat, storySupportedFormat } from "../../lib/utils";
import { FileUploadResponce, VideoUploadResponce } from "../../lib/types/Responses/User/Upload";
import BucketUpload from "../../lib/utils/Bucket";
import TranscodingMethods from "../../lib/utils/Transcoding";
import * as fs from "fs"
import { ffmpegELE, ffmpegPlaylist } from "../../lib/types/Common/Transcode";


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
				const data = (type === "video") ? await storyUp(req.file, req.User?._id ?? "") : await fileUp(req.file, req.User?._id ?? "");
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

		await TranscodingMethods.generateThumbnail(file, thumbnailName)

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
		throw error
	}
}

async function storyUp(file: Express.Multer.File, _id: string): Promise<VideoUploadResponce> {

	try {

		const fileName = `story_${Date.now()}`;
		const fileDirectory = `rhythmchat/${_id}/video/${fileName}`;

		fs.mkdirSync(`./transcodes/${fileName}`)
		const list: ffmpegELE[] = [
			{
				name: "high",
				resolution: "960x540",
				video_bitrate: 600,
				video_codec: "libx264",
				audio_bitrate: 128,
				audio_codec: "aac",
				bandswith: 3216424
			},
			{
				name: "mid",
				resolution: "960x540",
				video_bitrate: 400,
				video_codec: "libx264",
				audio_bitrate: 96,
				audio_codec: "aac",
				bandswith: 2177116
			},
			{
				name: "low",
				resolution: "960x540",
				video_bitrate: 200,
				video_codec: "libx264",
				audio_bitrate: 64,
				audio_codec: "aac",
				bandswith: 541052
			}
		]

		const playlistPaths: ffmpegPlaylist[] = []

		let flag = true
		for (const ele of list) {
			flag = await TranscodingMethods.generateABR(fileName, file.path, ele, playlistPaths)
		}

		if (flag) {
			await TranscodingMethods.createMasterPlaylist(fileName, playlistPaths)

			const files = fs.readdirSync(`./transcodes/${fileName}`)
			for (const file of files) {
				await BucketUpload.pushOnBucket(fileDirectory, undefined, `./transcodes/${fileName}/${file}`)
			}

		} else {
			throw new Error("Error in ABR..!")
		}

		const thumbnailName = `thumbnail_${Date.now()}.png`
		const thumbnailDirectory = `rhythmchat/${_id}/image/${thumbnailName}`;

		await TranscodingMethods.generateThumbnail(file, thumbnailName)
		await BucketUpload.pushOnBucket(thumbnailDirectory, undefined, `./transcodes/${thumbnailName}`)

		// remove the main file stored in disk 
		fs.unlinkSync(file.path)

		return {
			thumbnail: `${process.env.S3_URL}/${thumbnailDirectory}`,
			url: `${process.env.S3_URL}/${fileDirectory}/playlist.m3u8`
		}

	} catch (error) {
		throw error;
	}
}

const UploadController = {
	fileUpload,
	storyUpload
};

export default UploadController;