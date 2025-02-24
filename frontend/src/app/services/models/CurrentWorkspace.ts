export interface ICurrentWorkspace {
    idWorkspace: number;
    idRoom?: number;
    workspaceName?: string;
    idWorker?: number;
    fullWorkerName?: string;
    idStatusWorkspace?: number;
    idWorkspaceStatusType?: number;
    workspaceStatusTypeName?: string;
    idWorkspaceReservationsStatuses?: number;
    reservationStatuseName?: string;
    startDate?: string;
    endDate?: string;
}
