import { IReport } from "./Report";

export interface IReportsType {
    idReportsTypes: number;
    name: string;
    reports?: IReport[];
}
