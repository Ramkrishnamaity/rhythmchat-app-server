import { Request, Response } from "express";
import { Types } from "mongoose";
import { NotificationResponseType } from "../../../lib/types/Responses/User/Notification";
import NotificationModel from "../../../models/Notification";
import NotifyModel from "../../../models/Notify";
import { InputValidator } from "../../../lib/utils";
import { CommonQueryParamsType, Res } from "../../../lib/types/Common";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";

const fetchNotification = async (req: Request<any, any, any, CommonQueryParamsType>, res: Response<Res<NotificationResponseType[]>>) => {
    try {
        InputValidator(req.query, {
            page: "required"
        }).then(async () => {

            const page = req.query.page;
            const limit = 10;
            const skip = (page - 1) * limit;

            const notifications = await NotificationModel.aggregate([
                {
                    $match: {
                        receiverId: new Types.ObjectId(req.User?._id)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender",
                        pipeline: [
                            {
                                $project: {
                                    firstName: 1,
                                    lastName: 1,
                                    image: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        sender: 1,
                        isAccepted: 1,
                        createdOn: 1
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);

            const notify = await NotifyModel.findOne({ userId: req.User?._id });
            if (notify && notifications.length >= notify.count) {
                await NotifyModel.findByIdAndUpdate(
                    notify._id,
                    {
                        $set: {
                            count: 0
                        }
                    }
                );
            } else if (notify && notifications.length < notify.count) {
                await NotifyModel.findByIdAndUpdate(
                    notify._id,
                    {
                        $set: {
                            count: notify.count - notifications.length
                        }
                    }
                );
            }

            const totalNotification = await NotificationModel.countDocuments({ receiverId: req.User?._id });

            res.status(ResponseCode.SUCCESS).json({
                status: true,
                message: "Members Fetched Successfully.",
                data: notifications,
                totalPage: Math.ceil(totalNotification / limit)
            });

        }).catch(error => {
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

const UserNotificationController = {
    fetchNotification
};

export default UserNotificationController;