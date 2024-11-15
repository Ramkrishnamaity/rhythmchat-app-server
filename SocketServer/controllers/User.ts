import { Server } from "socket.io";
import UserNotificationMethods from "./Notiification";

const userList: Map<string, string> = new Map();
const socketList: Map<string, string> = new Map();

function addUser(userId: string, socketId: string, io: Server) {
    socketList.set(userId, socketId);
    userList.set(socketId, userId);
    console.log("userList", userList);
    UserNotificationMethods.NotifyFriends(userId ?? '', io, true)
}

function removeUser(socketId: string, io: Server) {
    const userId = userList.get(socketId)
    userList.delete(socketId)
    userId && socketList.delete(userId)
    console.log("userList", userList);
    UserNotificationMethods.NotifyFriends(userId ?? '', io, false)
}

function findSocketId(userId: string,) {
    return socketList.get(userId)
}

function findUserId(socketId: string,) {
    return userList.get(socketId)
}

const UserController = {
    addUser,
    removeUser,
    findSocketId,
    findUserId
};

export default UserController;