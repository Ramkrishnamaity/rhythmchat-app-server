import { Types } from "mongoose";

export type ConversationModelType<T> = T & {
    isGroup: boolean
    name?: string
    image?: string
    description?: string
    userId1?: Types.ObjectId
    userId2?: Types.ObjectId
    message: Types.ObjectId
}