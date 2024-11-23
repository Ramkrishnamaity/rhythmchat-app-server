import { Types } from "mongoose"


export type CallModelType<T> = T & {
    roomId: string
    host: Types.ObjectId
    isActive: boolean
    users: [
        {
            userId: Types.ObjectId,
            peerId: string
        }
    ]
    callDuration: number
}