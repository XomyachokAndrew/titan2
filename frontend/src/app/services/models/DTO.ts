export interface IRefreshTokenDto {
    refreshToken: string;
}

export interface IStatusWorkspaceDto {
    idStatusWorkspace: number;
    startDate?: string;
    endDate?: string;
    idStatus?: number;
    idWorker?: number;
    idUser: number;
}

export interface IUserLoginDto {
    login: string;
    password: string;
}

export interface IUserRegistrationDto {
    name: string;
    surname: string;
    patronymic?: string;
    login: string;
    password: string;
}

export interface IWorkspaceInfoDto {
    workspaceName?: string;
    statusName?: string;
    startDate?: string;
    endDate?: string;
    workerDetails?: any;
}
