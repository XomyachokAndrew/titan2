export interface RefreshTokenDto {
    refreshToken: string;
}

export interface StatusWorkspaceDto {
    idStatusWorkspace: number;
    startDate?: string;
    endDate?: string;
    idStatus?: number;
    idWorker?: number;
    idUser: number;
}

export interface UserLoginDto {
    login: string;
    password: string;
}

export interface UserRegistrationDto {
    name: string;
    surname: string;
    patronymic?: string;
    login: string;
    password: string;
}

export interface WorkspaceInfoDto {
    workspaceName?: string;
    statusName?: string;
    startDate?: string;
    endDate?: string;
    workerDetails?: any;
}
