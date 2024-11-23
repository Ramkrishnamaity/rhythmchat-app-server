import { Document, Schema, model } from "mongoose";
import { CommonModelType } from "../lib/types/Models";
import { CallModelType } from "../lib/types/Models/Call";

const CallSchema = new Schema<CallModelType<CommonModelType & Document["_id"]>>({
    host: {
        type: Schema.Types.ObjectId,
        required: true
    },
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    users: {
        type: [{
            userId: Schema.Types.ObjectId,
            peerId: String
        }]
    },
    callDuration: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
	createdOn: {
        type: Date,
        default: Date.now
    }
});

const CallModel = model<CallModelType<CommonModelType & Document["_id"]>>("calls", CallSchema);

export default CallModel;