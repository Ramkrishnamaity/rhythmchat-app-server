
const userList: Map<string, string> = new Map();
const socketList: Map<string, string> = new Map();

function addUser(userId: string, socketId: string) {
    socketList.set(userId, socketId);
    userList.set(socketId, userId);
    console.log("userList", userList);
}

function removeUser(socketId: string) {
    const userId = userList.get(socketId)
    userList.delete(socketId)
    userId && socketList.delete(userId)
    console.log("userList", userList);
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