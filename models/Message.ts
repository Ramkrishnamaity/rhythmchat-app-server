import { Document, Schema, model } from "mongoose";
import { MessageModelType } from "../lib/types/Models/Message";
import { CommonModelType } from "../lib/types/Models";

const MessageSchema = new Schema<MessageModelType<CommonModelType & Document["_id"]>>({
    conversationId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: ["text", "audio", "video", "image", "doc", "location"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
	createdOn: {
        type: Date,
        default: Date.now
    },
	updatedOn: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const MessageModel = model<MessageModelType<CommonModelType & Document["_id"]>>("messages", MessageSchema);

export default MessageModel;

