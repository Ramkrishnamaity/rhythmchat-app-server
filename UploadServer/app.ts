import express, { Application } from "express";
import rootRoute from "./routes/Index";
import logger from "morgan";
import cors from "cors";
import { connectDB } from "../lib/config/Database";
import fs from "fs"

const app: Application = express();
const port = process.env.UPLOAD_SERVER_PORT ?? 4051;

connectDB();

app.use(cors({
	origin: "*",
	credentials: true
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/v1", rootRoute);

app.listen(port, () => {
	console.log(`Upload Server is running on port http://127.0.0.1:${port}`);
});

const uploadFolder1 = "./transcodes/"
if (!fs.existsSync(uploadFolder1)) {
	fs.mkdirSync(uploadFolder1)
}
const uploadFolder2 = "./uploads/"
if (!fs.existsSync(uploadFolder2)) {
	fs.mkdirSync(uploadFolder2)
}