import { IStatusesWorkspace } from "./StatusesWorkspace";

export interface IWorkspaceReservationsStatus {
    idWorkspaceReservationsStatuses: number;
    name?: string;
    descriptions?: string;
    statusesWorkspaces?: IStatusesWorkspace[];
}