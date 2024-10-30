import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { CommonQueryParamsType, Res } from "../../lib/types/Common";
import { NotificationRequestType } from "../../lib/types/Requests/User/Notification";
import { NotificationResponseType } from "../../lib/types/Responses/User/Notification";
import { InputValidator } from "../../lib/utils";
import { ResponseCode, ResponseMessage } from "../../lib/utils/ResponseCode";
import ConversationModel from "../../models/Conversation";
import MessageModel from "../../models/Message";
import NotificationModel from "../../models/Notification";
import NotifyModel from "../../models/Notify";

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
                message: "Notification Fetched Successfully.",
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

async function sendNotification(data: NotificationRequestType): Promise<number> {
    try {
        await NotificationModel.create({ ...data });
        const notifyDoc = await NotifyModel.findOne({ userId: data.receiverId });
        if (!notifyDoc) {
            await NotifyModel.create({ userId: data.receiverId });
            return 1;
        } else {
            await NotifyModel.findByIdAndUpdate(
                notifyDoc._id,
                {
                    $set: {
                        count: notifyDoc.count + 1
                    }
                }
            );
            return notifyDoc.count + 1;
        }
    } catch (error) {
        throw error;
    }
}

async function fetchNotifies(userId: string): Promise<number> {
    try {
        const notifies = await NotifyModel.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    _id: 1,
                    count: 1
                }
            }
        ]);
        return notifies.length === 0 ? 0 : notifies[0].count;

    } catch (error) {
        throw error;
    }
}
 
const RequestAccept = async (id: string) => {
    try {
        const data = await NotificationModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    isAccepted: true
                }
            }
        );

        // conversation create
        const conversationId = new mongoose.Types.ObjectId();
        const message = await MessageModel.create({
            userId: data?.senderId,
            type: "text",
            message: "hlo, its great connecting with you.",
            conversationId
        });
        await ConversationModel.create({
            _id: conversationId,
            userId1: data?.senderId,
            userId2: data?.receiverId,
            message: message._id
        });
    } catch (error) {
        throw error;
    }
};

const RequestReject = async (id: string) => {
    try {
        await NotificationModel.findByIdAndDelete(id);
    } catch (error) {
        throw error;
    }
};

const UserNotificationController = {
    fetchNotification,
    sendNotification,
    fetchNotifies,
    RequestAccept,
    RequestReject
};

export default UserNotificationController;