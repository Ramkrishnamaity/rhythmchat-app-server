import { Document, Schema, model } from "mongoose";
import { CommonModelType } from "../lib/types/Models";
import { MemberModelType } from "../lib/types/Models/Member";

const MemberSchema = new Schema<MemberModelType<CommonModelType & Document["_id"]>>({
    groupId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        default: "member",
        enum: ["member", "admin"]
    },
	createdOn: {
        type: Date,
        default: Date.now
    }
});

const MemberModel = model<MemberModelType<CommonModelType & Document["_id"]>>("members", MemberSchema);

export default MemberModel;