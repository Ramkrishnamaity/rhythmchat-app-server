
export type UpdateProfileRequestType = {
    about: string
    firstName: string
    lastName: string
    image: string
}

export type UpdatePasswordRequestType = {
    oldPassword: string
    newPassword: string
}

export type ChangePasswordRequestType = {
    password: string
    confirmPassword: string
}

export type ResetPasswordRequestType = {
    email: string
}

export type ResetPasswordType = {
    password: string
    token: string
}

export type ResetPasswordParamsType = {
    token: string
}