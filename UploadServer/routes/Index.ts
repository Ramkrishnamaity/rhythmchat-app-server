import { Router } from "express";
import UserRouter from "./User";
import { middleware } from "../../lib/utils/Middleware";

const ApiRoute: Router = Router();

ApiRoute.use(middleware);

ApiRoute.use("/user", UserRouter);

export default ApiRoute;