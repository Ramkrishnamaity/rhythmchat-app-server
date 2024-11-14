export type OtpModelType <T> = T & {
    email: string,
    otp: string,
    createdAt: Date
}