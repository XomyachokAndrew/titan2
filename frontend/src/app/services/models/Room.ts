import { IWorkspace } from "./Workspace";

export interface IRoom {
    idRoom: number;
    name: string;
    totalWorkspace: number;
    idFloor: number;
    square?: number;
    idRoomStatus?: number;
    workspaces?: IWorkspace[];
}