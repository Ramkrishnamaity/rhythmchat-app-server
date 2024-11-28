import ffmpeg from "fluent-ffmpeg"
import * as fs from "fs"
import { ffmpegELE, ffmpegPlaylist } from "../types/Common/Transcode"



async function createMasterPlaylist(
    folderName: string,
    playlistPaths: ffmpegPlaylist[]
): Promise<void> {
    const masterPlaylistPath = `./transcodes/${folderName}/playlist.m3u8`

    const masterPlaylistContent = `#EXTM3U\n${playlistPaths
        .map(
            (playlistPath) =>
                `#EXT-X-STREAM-INF:BANDWIDTH=${playlistPath.bandswith},RESOLUTION=${playlistPath.resolution
                },CODECS="avc1.42001e,mp4a.40.2"\n${playlistPath.outputPath.split("/")[
                playlistPath.outputPath.split("/").length - 1
                ]
                }`
        )
        .join("\n")}`

    await new Promise((resolve, reject) => {
        fs.writeFile(masterPlaylistPath, masterPlaylistContent, async (err) => {
            if (err) {
                reject(err)
            } else {
                resolve(masterPlaylistPath)
            }
        })
    })
}

async function generateABR(
    folderName: string,
    path: string,
    ele: ffmpegELE,
    playlistPaths: ffmpegPlaylist[]
): Promise<boolean> {
    const outputPath = `./transcodes/${folderName}/${ele.name}.m3u8`

    const playlistPath = {
        resolution: ele.resolution,
        outputPath,
        videoCodec: ele.video_codec,
        audioCodec: ele.audio_codec,
        bandswith: ele.bandswith,
    }


    return new Promise((resolve, reject) => {
        ffmpeg(path)
            .videoBitrate(ele.video_bitrate)
            .audioBitrate(ele.audio_bitrate)
            .videoCodec(ele.video_codec)
            .audioCodec(ele.audio_codec)
            .size(ele.resolution)
            .addOption("-hls_time", "5")
            .addOption("-hls_list_size", "0")
            .keepDAR()
            .output(outputPath)
            .on("end", () => {
                playlistPaths.push(playlistPath)
                resolve(true)
            })
            .on("error", (error) => {
                console.log("error on abr", error)
                reject(false)
            })
            .run()
    })
}

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

const TranscodingMethods = {
    createMasterPlaylist,
    generateABR,
    generateThumbnail
}

export default TranscodingMethods