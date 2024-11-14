import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebase-sdk.json"


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount)
});

export const pushNotification = async (deviceToken: string, message: string, image: string) => {
    try {

        const messageData = {
            token: deviceToken,
            notification: {
                title: "Rhythmchat",
                body: message,
                image
            },
            webpush: {
                notification: {
                    click_action: process.env.CLIENT_BASE_URL,
                }
            }
        };
        await admin.messaging().send(messageData);

    } catch (error) {
        console.log("error on send push notification", error);
    }
};