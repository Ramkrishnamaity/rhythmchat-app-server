import { Types } from "mongoose";

export type ConversationResponseType = {
    _id: Types.ObjectId
    isGroup: boolean
    name?: string
    image?: string
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

export type SingleConversationResponseType = {
    _id: string
    type: string
    message: string
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