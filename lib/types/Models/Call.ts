import { Types } from "mongoose"


export type CallModelType<T> = T & {
    roomId: string
    hostId: Types.ObjectId
    users: [
        {
            userId: Types.ObjectId,
            peerId: string
        }
    ]
    callDuration: number
}