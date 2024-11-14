
export type CreateGroupRequestType = {
    groupData: {
        name: string
        image: string
        description: string
    },
    members: string[]
}