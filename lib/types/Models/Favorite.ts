import { Types } from "mongoose"


export type FavoriteModelType<T> = T & {
    conversationId: Types.ObjectId
    userId: Types.ObjectId
}