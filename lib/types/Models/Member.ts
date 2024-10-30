import { Types } from "mongoose";

export type MemberModelType<T> = T & {
    type: string
    groupId: Types.ObjectId
    userId: Types.ObjectId
}
