import { Types } from "mongoose"

export type ProfileResponceType = {
    about: string
    firstName: string
    lastName: string
    email: string
    image: string
    deviceToken: string
    updatedOn?: Date
}

export type AnotherProfileResponceType = {
    _id: Types.ObjectId
    firstName: string,
    lastName: string,
    about: string,
    image: string,
    email: string
}

export type MembersResponseType = {
    _id: string
    firstName: string
    lastName: string
    image: string
    about: string
    isFriend: boolean
    isInvited: boolean
}

export type FriendsResponseType = {
    _id: string
    firstName: string
    lastName: string
    image: string
}