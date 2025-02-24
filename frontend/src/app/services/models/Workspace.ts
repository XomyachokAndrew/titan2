import { IStatusesWorkspace } from "./StatusesWorkspace";

export interface IWorkspace {
    idWorkspace: number;
    name: string;
    idRoom: number;
    isDeleted: boolean;
    statusesWorkspaces?: IStatusesWorkspace[];
}