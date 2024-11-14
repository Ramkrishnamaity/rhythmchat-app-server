export type Res<T = Record<string, any>> = {
    status: boolean
    message: string
    data?: T
    error?: any
    totalPage?: number
}

export type ReqWithAuth<T = Record<string, any>> = T & {
    _id: string
}

declare module "express" {
    interface Request {
        User?: ReqWithAuth;
    }
}

export type CommonParamsType = {
    id: string
}

export type CommonQueryParamsType = {
    page: number
}
