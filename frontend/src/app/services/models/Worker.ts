import { IStatusesWorker } from "./StatusesWorker";
import { IStatusesWorkspace } from "./StatusesWorkspace";

export interface IWorker {
    idWorker: number;
    name: string;
    surname: string;
    patronymic?: string;
    isDeleted: boolean;
    statusesWorkers?: IStatusesWorker[];
    statusesWorkspaces?: IStatusesWorkspace[];
}