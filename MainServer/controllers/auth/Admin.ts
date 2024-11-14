import { Request, Response } from "express";
import { LoginRequestType } from "../../../lib/types/Requests/Auth/User";
import { UserLoginResponse } from "../../../lib/types/Responses/Auth/User";
import { Res } from "../../../lib/types/Common";
import generateToken, { InputValidator } from "../../../lib/utils";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";

const login = async (req: Request<any, any, LoginRequestType>, res: Response<Res<UserLoginResponse>>): Promise<void> => {
    try {

        InputValidator(req.body, {
            email: "required",
            password: "required"
        })
            .then(async () => {

                if (req.body.email === "ramkrishnamaity531@gmail.com" && req.body.password === "ramkrishna123") {
                    const token = generateToken({ _id: req.body.email });

                    res.cookie("token", token);

                    res.status(ResponseCode.SUCCESS).json({
                        status: true,
                        message: "User Logged in Successfully"
                    });
                } else {
                    res.status(ResponseCode.AUTH_ERROR).json({
                        status: false,
                        message: "Wrong Credential!"
                    });
                }
            })
            .catch(error => {
                res.status(ResponseCode.VALIDATION_ERROR).json({
                    status: false,
                    message: ResponseMessage.VALIDATION_ERROR,
                    error
                });
            });

    } catch (error) {
        res.status(ResponseCode.SERVER_ERROR).json({
            status: false,
            message: ResponseMessage.SERVER_ERROR,
            error
        });
    }
};

const AdminAuthController = {
    login
};

export default AdminAuthController;