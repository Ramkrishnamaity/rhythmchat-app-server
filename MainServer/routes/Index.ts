import { Router, Request, Response } from "express";
import UserAuthController from "../controllers/auth/User";
import UserRouter from "./User";
import { middleware } from "../../lib/utils/Middleware";
import UserProfileController from "../controllers/user/Profile";
import AdminAuthController from "../controllers/auth/Admin";
import AdminRouter from "./Admin";

const ApiRoute: Router = Router();

// admin auth apis
ApiRoute.post("/admin/login", AdminAuthController.login);

// user auth apis
ApiRoute.post("/user/login", UserAuthController.login);
ApiRoute.post("/user/register", UserAuthController.register);
ApiRoute.post("/user/otp", UserAuthController.sendOtp);
ApiRoute.post("/user/reset-password-request", UserProfileController.resetPasswordRequest);
ApiRoute.get("/user/check-reset/:token", UserProfileController.resetPasswordCheck);
ApiRoute.post("/user/reset-password", UserProfileController.resetPassword);

ApiRoute.use(middleware);

// user apis
ApiRoute.use("/user", UserRouter);

export default ApiRoute;