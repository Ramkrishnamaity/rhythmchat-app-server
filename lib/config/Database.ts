import mongoose from "mongoose";
import { Redis } from "ioredis";

async function connectDB() {
    const mongoURL = process.env.DB_URL ?? "mongodb://localhost:27017/";
    try {
        // mongodb connection
        await mongoose.connect(mongoURL);
        console.log("MongoDB connected.");

    } catch (error) {
        console.error("Connection error:", error);
        process.exit(1);
    }
}

const redisURL = process.env.REDIS_URL ?? "localhost:6379";
const redisCache: Redis = new Redis(redisURL);
redisCache.on("error", (err) => {
	console.error("Redis connection error:", err);
	// Handle the error, e.g., retry connection or exit the process
});

redisCache.on("connect", () => {
	console.log("Redis connection established");
});

redisCache.on("disconnect", () => {
	console.log("Redis connection disconnected");
});

export { connectDB, redisCache };