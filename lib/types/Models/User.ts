
export type UserModelType<T> = T & {
    about: string
    firstName: string
    lastName: string
    email: string
    password?: string
    image: string
    deviceToken: string
}