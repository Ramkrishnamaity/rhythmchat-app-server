import express, { Application } from "express";
import rootRoute from "./routes/Index";
import logger from "morgan";
import path from "path";
import cors from "cors";
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
app.use("/api/v1", rootRoute);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../build")))
app.get("*", (req, res)=> {
	res.sendFile(path.resolve(__dirname, "../build/index.html"))
})

app.listen(port, () => {
	console.log(`Main Server is running on port http://127.0.0.1:${port}`);
});
