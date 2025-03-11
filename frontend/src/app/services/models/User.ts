import { IRentalAgreement } from "./RentalAgreement";
import { IReport } from "./Report";
import { IStatusesWorker } from "./StatusesWorker";
import { IStatusesWorkspace } from "./StatusesWorkspace";

export interface IUser {
    idUser: number;
    login: string;
    password: string;
    name: string;
    surname: string;
    patronymic?: string;
    isAdmin: boolean;
    refreshToken?: string;
    rentalAgreements?: IRentalAgreement[];
    reports?: IReport[];
    statusesWorkers?: IStatusesWorker[];
    statusesWorkspaces?: IStatusesWorkspace[];
}