import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Res } from "../types/Common";
import { ResponseCode } from "./ResponseCode";
import generateToken from ".";
import { Socket } from "socket.io";
import { redisCache } from "../config/Database";

export const middleware = async (req: Request, res: Response<Res>, next: NextFunction): Promise<void> => {
	const authorization: string | undefined = req.headers.authorization;

	if (!authorization) {
		res.status(ResponseCode.AUTH_ERROR).json({
			status: false,
			message: "No credentials sent!"
		});
	} else {
		try {

			const decrypted = jwt.verify(authorization, process.env.JWT_SECRET ?? "") as JwtPayload;
			const cacheToken = await redisCache.get(`user:${decrypted._id}:token`);
			if (cacheToken !== authorization) {
				res.status(ResponseCode.LOGOUT).json({
					status: false,
					message: "This Session is Expired, Please Logout."
				});
			} else {
				req.User = {
					_id: decrypted._id
				};
				next();
			}

		} catch (error) {

			const cacheUser = await redisCache.get(authorization);
			if (!cacheUser) {
				res.status(ResponseCode.LOGOUT).json({
					status: false,
					message: "This Session is Expired, Please Logout."
				});
			} else {

				const token = generateToken({ _id: cacheUser });
				// push in redis cache
				await redisCache.set(`user:${cacheUser}:token`, token);
				await redisCache.set(token, cacheUser);
				res.status(ResponseCode.AUTH_ERROR).json({
					status: false,
					message: "Your Token is Expired.",
					data: {
						token
					}
				});
			}
		}
	}
};

export const socketMiddleware = async (socket: Socket, next: (err?: any) => void): Promise<void> => {
	const token: string | undefined = socket.handshake.auth.token;

	if (!token) {
		next(new Error("Logout"));
	} else {
		try {

			const decrypted = jwt.verify(token, process.env.JWT_SECRET ?? "") as JwtPayload;
			const cacheToken = await redisCache.get(`user:${decrypted._id}:token`);
			if (cacheToken !== token) next(new Error("Logout"));
			else next();

		} catch (error) {

			const cacheUser = await redisCache.get(token);
			if (!cacheUser) {
				next(new Error("Logout"));
			} else {
				const token = generateToken({ _id: cacheUser });
				// push in redis cache
				await redisCache.set(`user:${cacheUser}:token`, token);
				await redisCache.set(token, cacheUser);
				next(new Error(token));
			}
		}
	}
};