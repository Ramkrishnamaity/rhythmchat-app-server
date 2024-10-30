import { Request, Response } from "express";
import { Types } from "mongoose";
import { Res, CommonParamsType } from "../../../lib/types/Common";
import { ConversationResponseType, SingleConversationResponseType } from "../../../lib/types/Responses/User/Conversation";
import { InputValidator } from "../../../lib/utils";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";
import ConversationModel from "../../../models/Conversation";
import MessageModel from "../../../models/Message";

const getConversations = async (req: Request, res: Response<Res<ConversationResponseType[]>>) => {
    try {

        const data = await ConversationModel.aggregate([
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "members",
                    pipeline: [
                        {
                            $match: {
                                userId: new Types.ObjectId(req.User?._id)
                            }
                        },
                        {
                            $project: {
                                userId: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $match: {
                    $expr: {
                        $cond: [
                            {
                                $eq: ["$isGroup", false]
                            },
                            {
                                $or: [
                                    { userId1: new Types.ObjectId(req.User?._id) },
                                    { userId2: new Types.ObjectId(req.User?._id) }
                                ]
                            },
                            {
                                $ne: [
                                    {
                                        $size: "$members"
                                    }, 0
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    userId: {
                        $cond: [
                            { $eq: ["$isGroup", false] },
                            {
                                $cond: [
                                    {
                                        $eq: ["$userId1", new Types.ObjectId(req.User?._id)]
                                    },
                                    "$userId2",
                                    "$userId1"
                                ]
                            },
                            null
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "userId",
                    as: "user",
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
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "messages",
                    foreignField: "_id",
                    localField: "message",
                    as: "messageData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "userId",
                                as: "user",
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
                                path: "$user",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                userId: 0,
                                conversationId: 0,
                                _id: 0,
                                __v: 0
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$messageData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    members: 0,
                    userId: 0,
                    message: 0,
                    userId1: 0,
                    userId2: 0,
                    __v: 0,
                }
            },
            {
                $sort: {
                    updatedOn: -1
                }
            }
        ]);

        res.status(ResponseCode.SUCCESS).json({
            status: true,
            message: "Conversation Fetched Successfully.",
            data
        });

    } catch (error) {
        res.status(ResponseCode.SERVER_ERROR).json({
            status: false,
            message: ResponseMessage.SERVER_ERROR,
            error
        });
    }
};

const getSingleConversation = (req: Request<CommonParamsType>, res: Response<Res<SingleConversationResponseType[]>>) => {
    try {

        InputValidator(req.params, {
            id: "required"
        }).then(async () => {

            const data = await MessageModel.aggregate([
                {
                    $match: {
                        conversationId: new Types.ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "userId",
                        as: "user",
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
                    $project: {
                        conversationId: 0,
                        userId: 0,
                        __v: 0,
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ]);

            data.length !== 0 ?
                res.status(ResponseCode.SUCCESS).json({
                    status: true,
                    message: "Conversation Fetched Successfully.",
                    data
                }) :
                res.status(ResponseCode.NOT_FOUND_ERROR).json({
                    status: false,
                    message: ResponseMessage.NOT_FOUND_ERROR
                });
        }).catch((error: any) => {
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

const UserConversationController = {
    getConversations,
    getSingleConversation
};

export default UserConversationController;