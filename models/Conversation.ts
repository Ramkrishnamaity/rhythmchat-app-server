import { Document, Schema, model } from "mongoose";
import { ConversationModelType } from "../lib/types/Models/Conversation";
import { CommonModelType } from "../lib/types/Models";

const ConversationSchema = new Schema<ConversationModelType<CommonModelType & Document["_id"]>>({
    isGroup: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    userId1: {
        type: Schema.Types.ObjectId
    },
    userId2: {
        type: Schema.Types.ObjectId
    },
    message: {
        type: Schema.Types.ObjectId,
        required: true
    },
	createdOn: {
        type: Date,
        default: Date.now
    },
	updatedOn: {
        type: Date,
        default: Date.now
    }
});

const ConversationModel = model<ConversationModelType<CommonModelType & Document["_id"]>>("conversations", ConversationSchema);

export default ConversationModel;

