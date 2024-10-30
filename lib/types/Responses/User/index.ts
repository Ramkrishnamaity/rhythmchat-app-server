export type ProfileResponceType = {
    about: string
    firstName: string
    lastName: string
    email: string
    image: string
    deviceToken: string
    updatedOn?: Date
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