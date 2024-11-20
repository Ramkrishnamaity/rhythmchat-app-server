import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs"

const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    }
});

async function pushOnBucket(directory: string, file?: Express.Multer.File, filePath?: string ) {
    try {

        if(file) {
            const fileContent = fs.createReadStream(file.path)

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: directory,
                Body: fileContent,
                // ACL: "public-read",
            });
    
            await s3Client.send(command);
            
            fs.unlinkSync(file.path)

        } else if(filePath){

            const fileContent = fs.createReadStream(filePath)

            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: directory,
                Body: fileContent,
                // ACL: "public-read",
            });
    
            await s3Client.send(command);

            fs.unlinkSync(filePath)
        }

    } catch (error) {
        console.error("Error On upload: ", error);
        throw error;
    }
}

async function pullFromBucket(directory: string) {
    try {

        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: directory
        });

        await s3Client.send(command);

    } catch (error) {
        console.error("Error On upload: ", error);
        throw error;
    }
}

const BucketUpload = {
    pushOnBucket,
    pullFromBucket
};

export default BucketUpload;