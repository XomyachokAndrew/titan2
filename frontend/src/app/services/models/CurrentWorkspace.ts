export interface ICurrentWorkspace {
    idWorkspace: number;
    idRoom?: number;
    workspaceName?: string;
    idWorker?: number;
    fullWorkerName: string | null;
    idStatusWorkspace?: number;
    idWorkspaceStatusType?: number;
    workspaceStatusTypeName?: string;
    idWorkspaceReservationsStatuses?: number;
    reservationStatuseName?: string;
    startDate: string | null;
    endDate?: string;
}
