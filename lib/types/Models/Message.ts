import { Types } from "mongoose";

export type MessageModelType<T> = T & {
    conversationId: Types.ObjectId
    userId: Types.ObjectId
    type: string
    message: string
}
