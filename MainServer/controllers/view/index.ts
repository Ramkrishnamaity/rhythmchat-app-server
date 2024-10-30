import { Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

const isLoggedIn = (req: Request): boolean => {
    if (!req.cookies || !req.cookies.token) {
        return false;
    } else {
        try {
            verify(req.cookies.token, process.env.JWT_SECRET ?? "");
            return true;
        } catch (error) {
            return false;
        }
    }
};

const ViewController = {
    isLoggedIn
};

export default ViewController;