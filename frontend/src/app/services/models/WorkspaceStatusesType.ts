import { IStatusesWorkspace } from "./StatusesWorkspace";

export interface IWorkspaceStatusesType {
    idWorkspaceStatusType: number;
    name: string;
    descriptions?: string;
    statusesWorkspaces?: IStatusesWorkspace[];
}