import express, { Application } from "express";
import { Socket, Server } from "socket.io";
import { NotificationRequestType } from "../lib/types/Requests/User/Notification";
import UserNotificationMethods from "./controllers/Notiification";
import { socketMiddleware } from "../lib/utils/Middleware";
import UserController from "./controllers/User";
import { connectDB } from "../lib/config/Database";
import UserConversationController from "../MainServer/controllers/user/Conversation";
import MemberModel from "../models/Member";
import { Types } from "mongoose";
import UserMessageMethods from "./controllers/Message";
import { MessageType } from "../lib/types/Models/Message";

const app: Application = express();
const port = process.env.SOCKET_SERVER_PORT ?? 4052;

connectDB();

const server = app.listen(port, () => {
    console.log(`Socket Server is running on port http://127.0.0.1:${port}`);
});

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.use((socket: Socket, next: (err?: any) => void) => {
    socketMiddleware(socket, next);
});

io.on("connection", (socket: Socket) => {

    socket.on("user", async (id: string | undefined) => {
        try {
            if (id) {
                UserController.addUser(id, socket.id, io);
                const notify = await UserNotificationMethods.fetchNotifies(id);
                socket.emit("notify", notify);
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("send-request", async (data: NotificationRequestType) => {
        try {
            const notify = await UserNotificationMethods.sendNotification(data);
            const receiver = UserController.findSocketId(data.receiverId);
            if (receiver) {
                io.to(receiver).emit("notify", notify);
            } else {
                await UserNotificationMethods.notifyFriendRequest(data)
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("notify-me", async (id: string | undefined) => {
        if (id) {
            const notify = await UserNotificationMethods.fetchNotifies(id);
            socket.emit("notify", notify);
        }
    });

    socket.on("request-accept", async (id: string) => {
        try {
            const { conversationId, user1, user2 } = await UserNotificationMethods.RequestAccept(id);
            const user1Socket = UserController.findSocketId(user1)
            const user2Socket = UserController.findSocketId(user2)
            if (user1Socket) {
                const data = await UserConversationController.getNewConversation(conversationId, user1, user2)
                io.to(user1Socket).emit("new-chat", data);
            }
            if (user2Socket) {
                const data = await UserConversationController.getNewConversation(conversationId, user2, user1)
                io.to(user2Socket).emit("new-chat", data);
            }
        } catch (error) {
            console.log(error)
        }
    });

    socket.on("request-reject", async (id: string) => {
        await UserNotificationMethods.RequestReject(id);
    });

    socket.on("notify-group-members", async (conversationId: string) => {
        try {
            const userId = UserController.findUserId(socket.id) ?? ''
            const groupData = await UserConversationController.getNewConversation(conversationId, userId)
            const members = await MemberModel.aggregate([
                {
                    $match: {
                        groupId: new Types.ObjectId(conversationId),
                        type: "member"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        userId: 1
                    }
                }
            ])
            for(let ele of members) {
                const userSocketId = UserController.findSocketId(ele.userId.toString())
                if(userSocketId) {
                    io.to(userSocketId).emit("new-chat", groupData);
                } else {
                    await UserNotificationMethods.notifyGroupNotification(conversationId, ele.userId.toString(), groupData.image ?? '')
                }
            }

        } catch (error) {
            console.log("error on Notify group Member.", error)
        }
    })

    socket.on('join-room', (conversationId: string)=> {
        console.log("JOined", conversationId)
        socket.join(conversationId)
    })

    socket.on('leave-room', (conversationId: string)=> {
        console.log("leave", conversationId)
        socket.leave(conversationId)
    })

    socket.on('message', async (message: MessageType)=> {
        await UserMessageMethods.addMessage(io, message)
    })

    socket.on('is-online-ques', (userId: string)=> {
        if(UserController.findSocketId(userId)) {
            socket.emit('is-online-ans', true)
        } else {
            socket.emit('is-online-ans', false)
        }
    })

    socket.on("disconnect", () => {
        // UserController.removeUser(socket.id, io);
        socket.disconnect();
    });
});