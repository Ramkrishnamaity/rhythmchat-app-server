import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import MessageModel from "../../models/Message";
import ConversationModel from "../../models/Conversation";
import { MessageType } from "../../lib/types/Models/Message";
import UserController from "./User";
import MemberModel from "../../models/Member";


async function addMessage(io: Server, message: MessageType) {
    try {

        const messageData = await MessageModel.create(
            message
        )
        const conversationData = await ConversationModel.findByIdAndUpdate(
            message.conversationId,
            {
                $set: {
                    message: messageData._id,
                    updatedOn: Date.now()
                }
            }
        )

        const sendData = {
            ...message,
            userID: undefined,
            createdOn: messageData.createdOn,
            updatedOn: messageData.updatedOn,
            isDeleted: false
        }

        io.to(message.conversationId).emit("new-message-in", sendData);

        if (conversationData && !conversationData?.isGroup) {
            const user1Socket = UserController.findSocketId(conversationData.userId1?.toString() ?? "")
            const user2Socket = UserController.findSocketId(conversationData.userId2?.toString() ?? "")

            user1Socket && io.to(user1Socket).emit("new-message-out", sendData);
            user2Socket && io.to(user2Socket).emit("new-message-out", sendData);
        } else if (conversationData && conversationData?.isGroup) {
            const members = await MemberModel.find({
                groupId: conversationData._id
            })

            for(let member of members) {
                const userSocket = UserController.findSocketId(member.userId.toString())
                userSocket && io.to(userSocket).emit("new-message-out", sendData);
            }
        }

    } catch (error) {
        console.log(error)
    }
}



const UserMessageMethods = {
    addMessage
};

export default UserMessageMethods;