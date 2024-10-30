
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
    addUser,
    removeUser,
    findIndex,
    findSocketId,
    findUserId
};

export default UserController;