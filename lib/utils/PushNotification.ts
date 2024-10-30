// import admin from "firebase-admin";
// import UserModel from "../../models/User";

// const serviceAccount = require("./firebase-sdk.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// export const sendNotification = async (receiver: string, message: string, sender: string) => {
//     try {

//         const receiverToken = await UserModel.findById(receiver);
//         if (receiverToken && receiverToken.deviceToken) {
//             const messageData = {
//                 notification: {
//                     title: "Rhythmchat",
//                     body: "message",
//                     // icon: 'http://127.0.0.1:4050/api/v1/uploads/profile.png'
//                 },
//                 token: receiverToken.deviceToken
//             };
//             console.log("first", messageData);

//             const response = await admin.messaging().send(messageData);
//             console.log(response, "responce of push notification");
//         }

//     } catch (error) {
//         console.log("error on send push notification", error);
//     }
// };