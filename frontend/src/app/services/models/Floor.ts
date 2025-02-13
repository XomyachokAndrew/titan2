import { IRoom } from "./Room";

export interface IFloor {
    idFloor: number;
    numberFloor: number;
    totalWorkspace: number;
    scheme?: string;
    idOffice: number;
    square?: number;
    rooms: IRoom[];
}