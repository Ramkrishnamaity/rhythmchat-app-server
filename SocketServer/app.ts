import express, { Application } from "express";
import { Socket, Server } from "socket.io";
import { NotificationRequestType } from "../lib/types/Requests/User/Notification";
import UserNotificationController from "./controllers/Notiification";
import { socketMiddleware } from "../lib/utils/Middleware";
import UserController from "./controllers/User";
// import { sendNotification } from "../lib/utils/PushNotification";
import { connectDB } from "../lib/config/Database";

const app: Application = express();
const port = process.env.SOCKET_SERVER_PORT ?? 4052;

connectDB();

const server = app.listen(port, () => {
    console.log(`Socket Server is running on port http://127.0.0.1:${port}`);
});

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_BASE_URL
    }
});

io.use((socket: Socket, next: (err?: any) => void) => {
    socketMiddleware(socket, next);
});

io.on("connection", (socket: Socket) => {

    console.log("new User Joined", socket.id);
    socket.on("user", async (id: string | undefined) => {
        try {
            if (id) {
                UserController.addUser(id, socket.id);
                const notify = await UserNotificationController.fetchNotifies(id);
                socket.emit("notify", notify);
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("send-request", async (data: NotificationRequestType) => {
        try {
            const notify = await UserNotificationController.sendNotification(data);
            const receiver = UserController.findSocketId(data.receiverId);
            if (receiver) {
                io.to(receiver).emit("notify", notify);
                // await sendNotification(data.senderId, data.receiverId, "You have new Friend Request.");
            }
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("notify-me", async (id: string | undefined) => {
        if (id) {
            const notify = await UserNotificationController.fetchNotifies(id);
            socket.emit("notify", notify);
        }
    });

    socket.on("request-accept", async (id: string) => {
        await UserNotificationController.RequestAccept(id);

    });

    socket.on("request-reject", async (id: string) => {
        await UserNotificationController.RequestReject(id);
    });

    socket.on("disconnect", () => {
        console.log("a user disconnected");
        UserController.removeUser(UserController.findIndex(socket.id));
        socket.disconnect();
    });
});