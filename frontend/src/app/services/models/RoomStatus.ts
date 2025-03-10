import { IRoom } from "./Room";

export interface IRoomStatus {
    idRoomStatus: number;
    name: string;
    descriptions?: string;
    rooms?: IRoom[];
}