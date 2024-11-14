import { Request, Response } from "express";
import { Types } from "mongoose";
import { Res } from "../../../lib/types/Common";
import { ConversationResponseType } from "../../../lib/types/Responses/User/Conversation";
import { InputValidator } from "../../../lib/utils";
import { ResponseCode, ResponseMessage } from "../../../lib/utils/ResponseCode";
import ConversationModel from "../../../models/Conversation";
import MessageModel from "../../../models/Message";
import UserModel from "../../../models/User";
import { MemberRequestType } from "../../../lib/types/Requests/User/Member";
import MemberModel from "../../../models/Member";
import { CreateGroupRequestType } from "../../../lib/types/Requests/User/Group";

const createGroup = (req: Request<any, any, CreateGroupRequestType>, res: Response<Res<ConversationResponseType>>) => {
    try {

        InputValidator(req.body, {
            "groupData.name": "required",
            "groupData.image": "required",
            "groupData.description": "required",
            "members": "required"
        }).then(async () => {
            const _id = new Types.ObjectId;
            const message = await MessageModel.create({
                conversationId: _id,
                userId: req.User?._id,
                type: "text",
                message: "Welcome to our Group."
            });

            const members: MemberRequestType[] = req.body.members.reduce((accumulator: MemberRequestType[], expense: string) => {
                accumulator.push({ groupId: _id, userId: expense });
                return accumulator;
            }, []);
            members.push({ groupId: _id, userId: req.User?._id ?? "", type: "admin" });
            await MemberModel.insertMany(members);

            const conversation = await ConversationModel.create({
                _id,
                isGroup: true,
                message: message._id,
                ...req.body.groupData
            });

            const userData = await UserModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(req.User?._id)
                    }
                },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        image: 1,
                        lastName: 1
                    }
                }
            ]);

            const groupData: ConversationResponseType = {
                _id: conversation._id,
                isGroup: true,
                name: conversation.name,
                description: conversation.description,
                image: conversation.image,
                createdOn: conversation.createdOn,
                updatedOn: conversation.updatedOn,
                messageData: {
                    _id: message._id,
                    createdOn: message.createdOn,
                    isDeleted: message.isDeleted,
                    message: message.message,
                    type: message.type,
                    updatedOn: message.updatedOn,
                    user: userData[0]
                }
            };

            res.status(ResponseCode.SUCCESS).json({
                status: true,
                message: "Group Created Successfully.",
                data: groupData
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

const UserGroupController = {
    createGroup
};

export default UserGroupController;