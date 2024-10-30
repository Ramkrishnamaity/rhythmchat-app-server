import { Types } from "mongoose";

export type MemberRequestType = {
    groupId: Types.ObjectId
    userId: string
    type?: string
}