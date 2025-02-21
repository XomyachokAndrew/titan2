export interface IHistoryWorkspaceStatus {
    idWorkspace: number;
    idStatusWorkspace?: number;
    startDate?: string; // Используйте строку для даты, так как DateOnly не имеет прямого аналога в JavaScript
    endDate?: string;
    idWorkspaceStatusType?: number;
    workspaceStatusTypeName?: string;
    idWorkspaceReservationsStatuses?: number;
    workspaceReservationStatuseName?: string;
    workerFullName?: string;
    userName?: string;
  }
  