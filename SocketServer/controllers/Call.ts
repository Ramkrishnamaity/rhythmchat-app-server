import { Server, Socket } from "socket.io";
import UserController from "./User";
import CallModel from "../../models/Call";
import { Types } from "mongoose";
import ConversationModel from "../../models/Conversation";
import MemberModel from "../../models/Member";


export default function CallManager(socket: Socket, io: Server) {

    socket.on('room-join', async ({ roomId, peerId }) => {
        try {
            socket.join(roomId)
            const userId = UserController.findUserId(socket.id)
            const room = await CallModel.findOneAndUpdate(
                {
                    roomId
                },
                {
                    $push: {
                        users: {
                            userId: new Types.ObjectId(userId),
                            peerId
                        }
                    }
                },
                {
                    projection: {
                        _id: 0,
                        roomId: 1,
                        users: 1,
                        host: 1
                    },
                    new: true
                }
            )
            io.to(roomId).emit("get-room-members", room)
        } catch (error) {
            console.log(error, "in Room JOin")
        }
    })

    socket.on('room-invite', async ({ roomId, isGroup, conversationId, profile }) => {
        try {
            await CallModel.create({
                host: conversationId,
                roomId,
                users: []
            })
            socket.emit("room-created", roomId)
            const hostId = UserController.findUserId(socket.id)
            if (JSON.parse(isGroup)) {
                const users = await MemberModel.find(
                    {
                        groupId: conversationId,
                        userId: { $ne: hostId }
                    }
                )
                if (users.length > 0) {
                    for (let user of users) {
                        const userSocket = UserController.findSocketId(user.toString())
                        if (userSocket) {
                            const isOnCall = await CallModel.findOne(
                                {
                                    users: { $in: user.toString() },
                                    isActive: true
                                }
                            )
                            !isOnCall && io.to(userSocket).emit('room-request', { roomId, profile })
                        }
                    }
                }
            } else {
                const conversation = await ConversationModel.findById(conversationId)
                if (conversation && conversation.userId1 && conversation.userId2) {
                    const user = hostId !== conversation.userId1.toString() ? conversation.userId2.toString() : conversation.userId1.toString()
                    const userSocket = UserController.findSocketId(user)
                    if (userSocket) {
                        const isOnCall = await CallModel.findOne(
                            {
                                users: { $in: user.toString() },
                                isActive: true
                            }
                        )
                        !isOnCall && io.to(userSocket).emit('room-request', { roomId, profile })
                    }
                }
            }
        } catch (error) {
            console.log(error, "in Room invite")
        }
    })

}