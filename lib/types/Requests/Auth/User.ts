
export type RegisterRequestType = {
    firstName: string
    lastName: string
    email: string
    password: string
    image?: string
    otp: string
}

export type LoginRequestType = {
    email: string
    password: string
}

export type OtpRequestType = {
    email: string
}