import { Server, Socket } from "socket.io";
import UserController from "./User";
import CallModel from "../../models/Call";
import { Types } from "mongoose";


export default function CallManager(socket: Socket, io: Server) {

    socket.on('room-join', async ({roomId, peerId}) => {
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
                        hostId: 1
                    },
                    new: true
                }
            )
            io.to(roomId).emit("get-room-members", room)
        } catch (error) {
            console.log(error, "in Room JOin")
        }
    })

    socket.on('room-invite', async ({roomId, userId}) => {
        try {
            const hostId = UserController.findUserId(socket.id)
            await CallModel.create({
                hostId,
                roomId,
                users: []
            })
            socket.emit("room-created", roomId)
            const userSocket = UserController.findSocketId(userId)
            if (userSocket) {
                io.to(userSocket).emit('room-request', roomId)
            } else {
                console.log("notify User Because user is Offline")
            }
        } catch (error) {
            console.log(error, "in Room invite")
        }
    })

}