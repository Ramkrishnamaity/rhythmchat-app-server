

export type ffmpegELE = {
    name: string;
    resolution: string;
    video_bitrate: number;
    video_codec: string;
    audio_bitrate: number;
    audio_codec: string;
    bandswith: number;
};

export type ffmpegPlaylist = {
    resolution: string;
    outputPath: string;
    bandswith: number;
    videoCodec: string;
    audioCodec: string;
};