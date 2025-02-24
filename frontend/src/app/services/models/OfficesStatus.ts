import { IOffice } from "./Office";

export interface IOfficesStatus {
    idOfficeStatus: number;
    name: string;
    offices?: IOffice[];
}