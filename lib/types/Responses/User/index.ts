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

type MembersType = {
    type: string,
    userId: Types.ObjectId,
    firstName: string,
    lastName: string,
    image: string,
    isFriend: boolean,
    createdOn: Date
}

export type GroupProfileResponceType = {
    name: string,
    image: string,
    description: string,
    members: MembersType[],
    totalMembers: number
    createdOn: Date
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