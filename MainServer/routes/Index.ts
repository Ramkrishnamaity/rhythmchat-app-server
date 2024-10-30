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
ApiRoute.post("/user/reset-password", UserProfileController.resetPasswordRequest);
ApiRoute.get("/user/reset-password/:id/:token", UserProfileController.resetPassword);
ApiRoute.post("/user/change-password/:id", UserProfileController.changePassword);

ApiRoute.get("/message/:msg", (req: Request<{ msg: string }>, res: Response) => {
    res.render("Message", { msg: req.params.msg });
});

ApiRoute.use(middleware);

// user apis
ApiRoute.use("/user", UserRouter);

export default ApiRoute;