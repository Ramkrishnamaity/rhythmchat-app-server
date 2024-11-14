import { Document, Schema, model } from "mongoose";
import { NotificationModelType } from "../lib/types/Models/Notification";
import { CommonModelType } from "../lib/types/Models";

const NotificationSchema = new Schema<NotificationModelType<CommonModelType & Document["_id"]>>({
    senderId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    isAccepted: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const NotificationModel = model<NotificationModelType<CommonModelType & Document["_id"]>>("notifications", NotificationSchema);

export default NotificationModel;

