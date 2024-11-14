import { Types } from "mongoose";

export type NotificationModelType<T> = T & {
    senderId: Types.ObjectId
    receiverId: Types.ObjectId
    image: string
    isAccepted?: boolean
}

export type NotifyModelType<T> = T & {
    userId: Types.ObjectId
    count: number
}