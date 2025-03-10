import { IStatusesWorker } from "./StatusesWorker";

export interface IPost {
    idPost: number;
    name: string;
    descriptions?: string;
    statusesWorkers?: IStatusesWorker[];
}