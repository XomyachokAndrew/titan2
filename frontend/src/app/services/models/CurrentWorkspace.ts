export interface CurrentWorkspace  {
    idWorkspace?: number;
    idRoom?: number;
    workspaceName?: string;
    idWorker?: number;
    fullWorkerName?: string;
    idStatusWorkspace?: number;
    idStatus?: number;
    startDate?: string; // Use string to represent DateOnly in TypeScript
    endDate?: string;   // Use string to represent DateOnly in TypeScript
    statusName?: string;
}
