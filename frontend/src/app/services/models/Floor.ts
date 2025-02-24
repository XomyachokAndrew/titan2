import { IRoom } from "./Room";

export interface IFloor {
    idFloor: number;
    numberFloor: number;
    totalWorkspace: number;
    idOffice: number;
    square?: number;
    freeWorkspaces: number;
    scheme: string;
    rooms?: IRoom[];
}