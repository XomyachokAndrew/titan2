export interface IDepartmentCostInfoDto {
    departmentName: string;
    totalCost: number;
    workspaceCount: number;
}

export interface IFloorDto {
    idFloor: number;
    numberFloor: number;
    totalWorkspace: number;
    schemeContent?: string;
    idOffice: number;
    square?: number;
    freeWorkspaces: number;
    reservedWorkspaces: number;
    rooms: IRoomDto[];
}

export interface IOfficeDto {
    idOffice: number;
    officeName: string;
    address: string;
    city: string;
    imageUrl: string;
    square?: number;
    totalWorkspace?: number;
    freeWorkspaces?: number;
    reservedWorkspaces: number;
    density?: number;
}

export interface IRefreshTokenDto {
    refreshToken: string;
}

export interface IRoomDto {
    idRoom: number;
    name: string;
    totalWorkspace: number;
    freeWorkspace?: number;
    square?: number;
}

export interface IStatusWorkerDto {
    idStatusWorker: number;
    idWorker: number;
    startDate?: string;
    endDate?: string;
    idPost: number;
    idDepartment: number;
    idUser: number;
    idStatus?: number;
}

export interface IStatusWorkspaceDto {
    idStatusWorkspace: number;
    idWorkspace: number;
    startDate?: string;
    endDate?: string;
    idWorkspaceStatusType?: number;
    idWorker?: number;
    idUser: number;
    idWorkspacesReservationsStatuses?: number;
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

export interface IWorkerDto {
    name: string;
    surname: string;
    patronymic?: string;
}

export interface IWorkspaceDto {
    name: string;
    idRoom: number;
}

export interface IWorkspaceInfoDto {
    workspaceName?: string;
    statusName?: string;
    startDate?: string;
    endDate?: string;
    workerDetails: {
        fullWorkerName?: string;
        postName?: string;
        departmentName?: string;
    };
    reservationStatuseName?: string;
}

export interface IOfficeCostInfoDto {
    officeCost: number;
    officeSquare?: number;
    officeFreeWorkspace?: number;
    priceWorkspace?: number;
    departmentCosts: IDepartmentCostInfoDto[];
}
