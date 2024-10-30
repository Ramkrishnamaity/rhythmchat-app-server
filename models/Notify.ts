import { Document, Schema, model } from "mongoose";
import { NotifyModelType } from "../lib/types/Models/Notification";

const NotifySchema = new Schema<NotifyModelType<Document["_id"]>>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
});

const NotifyModel = model<NotifyModelType<Document["_id"]>>("notifies", NotifySchema);

export default NotifyModel;

