import { Types } from "mongoose";

export type ConversationResponseType = {
    _id: Types.ObjectId
    isGroup: boolean
    name?: string
    image?: string
    isFavorite: boolean
    description?: string
    messageData: {
        _id: Types.ObjectId
        user: {
            _id: string
            firstName: string
            lastName: string
            image: string
        }
        type: string
        message: string
        thumbnail?: string
        createdOn?: Date
        updatedOn?: Date
        isDeleted?: boolean
    },
    user?: {
        _id: string
        firstName: string
        lastName: string
        image: string
    },
    createdOn?: Date
    updatedOn?: Date
}

export type NewGroupResponceType = {
    groupData: ConversationResponseType,
    members: {
        userId: Types.ObjectId
    }[]
}

export type SingleConversationResponseType = {
    _id: string
    type: string
    message: string
    thumbnail?: string
    user: {
        _id: string
        firstName: string
        lastName: string
        image: string
    } 
    createdOn: Date
    updatedOn: Date
    isDeleted: boolean
}[]