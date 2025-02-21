import { IRoom } from "./Room";

export interface IRefreshTokenDto {
    refreshToken: string;
}

export interface IStatusWorkspaceDto {
    idStatusWorkspace: number;
    startDate: string;
    endDate?: string | null;
    idWorkspaceStatusType: number;
    idWorker?: number;
    idUser: number;
    idWorkspacesReservationsStatuses: number;
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
    workerDetails: any;
}

export interface IOfficeDto {
    idOffice: number;
    officeName: string;
    city: string;
    address: string;
    imageUrl: string;
    square?: number;
    totalWorkspace: number;
    occupiedWorkspaces: number;
    density?: number;
}

export interface IFloorDto {
    idFloor: number;
    numberFloor: number;
    totalWorkspace: number;
    schemeContent?: string;
    idOffice: number;
    square?: number;
    occupiedWorkspaces: number;
    reservedWorkspaces: number;
    rooms: IRoom[];
}

export interface IWorkspaceDto {
    name: string;
    idRoom: number;
}