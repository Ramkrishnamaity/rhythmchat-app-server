import express, { Application } from "express";
import rootRoute from "./routes/Index";
import logger from "morgan";
import path from "path";
import cors from "cors";
import ViewRouter from "./routes/View";
import { connectDB } from "../lib/config/Database";

const app: Application = express();
const port = process.env.MAIN_SERVER_PORT ?? 4050;

connectDB();

app.use(cors({
	origin: "*",
	credentials: true
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/v1", rootRoute);
app.use("/", ViewRouter);

app.listen(port, () => {
	console.log(`Main Server is running on port http://127.0.0.1:${port}`);
});
