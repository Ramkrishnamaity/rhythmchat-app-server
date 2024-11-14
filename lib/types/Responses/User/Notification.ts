
export type NotificationResponseType = {
    _id: string,
    sender: {
        _id: string
        firstName: string,
        lastName: string,
        image: string
    },
    isAccepted: boolean
    createdOn: string
}