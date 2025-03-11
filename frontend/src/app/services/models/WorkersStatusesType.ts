import { IStatusesWorker } from "./StatusesWorker";

export interface IWorkersStatusesType {
    idStatus: number;
    name: string;
    description?: string;
    statusesWorkers?: IStatusesWorker[];
}