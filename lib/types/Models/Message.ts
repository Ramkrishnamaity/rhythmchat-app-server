import { Types } from "mongoose";

export type MessageModelType<T> = T & {
    conversationId: Types.ObjectId
    userId: Types.ObjectId
    type: string
    message: string
}

export type MessageType = {
    conversationId: string;
    userId: string;
    user: {
        _id: string
        firstName: string
        lastName: string
        image: string
    }
    type: string;
    message: string;
}
