import { Request, Response } from "express";
import { Types } from "mongoose";
import { Res } from "../../../lib/types/Common";
import { MemberParamsType } from "../../../lib/types/Requests/User";
import { FriendsResponseType, MembersResponseType } from "../../../lib/types/Responses/User";
import { InputValidator } from "../../../lib/utils";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";
import UserModel from "../../../models/User";

const getMembers = async (req: Request<any, any, any, MemberParamsType>, res: Response<Res<MembersResponseType[]>>) => {
    try {
        InputValidator(req.query, {
            str: "required",
            page: "required"
        }).then(async () => {

            const searchStr = req.query.str;
            const page = req.query.page;
            const limit = 10;
            const skip = (page - 1) * limit;

            const users = await UserModel.aggregate([
                {
                    $match: {
                        _id: { $ne: new Types.ObjectId(req.User?._id) },
                        $or: [
                            { firstName: { $regex: searchStr, $options: "i" } },
                            { lastName: { $regex: searchStr, $options: "i" } },
                            { email: { $regex: searchStr, $options: "i" } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "notifications",
                        as: "requests",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $or: [
                                        {
                                            senderId: new Types.ObjectId(req.User?._id),
                                            $expr: {
                                                $eq: ["$receiverId", "$$userId"]
                                            }
                                        },
                                        {
                                            $expr: {
                                                $eq: ["$senderId", "$$userId"]
                                            },
                                            receiverId: new Types.ObjectId(req.User?._id)
                                        }
                                    ]

                                }
                            },
                            {
                                $project: {
                                    isAccepted: 1,
                                    _id: 0
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        firstName: 1,
                        lastName: 1,
                        image: 1,
                        about: 1,
                        isFriend: {
                            $cond: [
                                { $eq: [{ $size: "$requests" }, 0] },
                                false,
                                { $eq: [{ $arrayElemAt: ["$requests.isAccepted", 0] }, true] }
                            ]
                        },
                        isInvited: {
                            $cond: [
                                { $eq: [{ $size: "$requests" }, 0] },
                                false,
                                { $eq: [{ $arrayElemAt: ["$requests.isAccepted", 0] }, false] }
                            ]
                        }
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

            const totalUser = await UserModel.countDocuments({
                _id: { $ne: req.User?._id },
                $or: [
                    { firstName: { $regex: searchStr, $options: "i" } },
                    { lastName: { $regex: searchStr, $options: "i" } },
                    { email: { $regex: searchStr, $options: "i" } }
                ]
            });

            res.status(ResponseCode.SUCCESS).json({
                status: true,
                message: "Members Fetched Successfully.",
                data: users,
                totalPage: Math.ceil(totalUser / limit)
            });

        }).catch(error => {
            console.log(error);
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

const getFriends = async (req: Request, res: Response<Res<FriendsResponseType[]>>) => {
    try {

        const users = await UserModel.aggregate([
            {
                $match: {
                    _id: { $ne: new Types.ObjectId(req.User?._id) }
                }
            },
            {
                $lookup: {
                    from: "notifications",
                    as: "requests",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $or: [
                                    {
                                        senderId: new Types.ObjectId(req.User?._id),
                                        $expr: {
                                            $eq: ["$receiverId", "$$userId"]
                                        }
                                    },
                                    {
                                        $expr: {
                                            $eq: ["$senderId", "$$userId"]
                                        },
                                        receiverId: new Types.ObjectId(req.User?._id)
                                    }
                                ]

                            }
                        },
                        {
                            $project: {
                                isAccepted: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    isFriend: {
                        $cond: [
                            { $eq: [{ $size: "$requests" }, 0] },
                            false,
                            { $eq: [{ $arrayElemAt: ["$requests.isAccepted", 0] }, true] }
                        ]
                    }
                }
            },
            {
                $match: {
                    isFriend: true
                }
            },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    image: 1
                }
            }
        ]);

        res.status(ResponseCode.SUCCESS).json({
            status: true,
            message: "Friends Fetched Successfully.",
            data: users
        });

    } catch (error) {
        res.status(ResponseCode.SERVER_ERROR).json({
            status: false,
            message: ResponseMessage.SERVER_ERROR,
            error
        });
    }
};

const userList: { userId: string, socketId: string }[] = [];

function addUser(userId: string, socketId: string) {
    const existingUser = userList.find(user => user.userId === userId);
    if (existingUser) {
        existingUser.socketId = socketId;
    } else {
        userList.push({ userId, socketId });
    }
    console.log("userList", userList);
}

function removeUser(index: number) {
    if (index !== -1) {
        userList.splice(index, 1);
    }
    console.log("userList", userList);
}

function findIndex(socketId: string) {
    return userList.findIndex((ele) => ele.socketId === socketId);
}

function findSocketId(userId: string,) {
    const user = userList.find((ele) => ele.userId === userId);
    return user?.socketId;
}

function findUserId(socketId: string,) {
    const user = userList.find((ele) => ele.socketId === socketId);
    return user?.userId;
}

const UserController = {
    getMembers,
    getFriends,
    addUser,
    removeUser,
    findIndex,
    findSocketId,
    findUserId
};

export default UserController;