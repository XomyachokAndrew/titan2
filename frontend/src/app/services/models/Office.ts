import { IFloor } from "./Floor";
import { IRentalAgreement } from "./RentalAgreement";

export interface IOffice {
    idOffice: number;
    officeName: string;
    address: string;
    idOfficeStatus: number;
    square?: number;
    image?: string;
    totalWorkspace: number;
    city: string;
    freeWorkspaces: number;
    floors?: IFloor[];
    rentalAgreements?: IRentalAgreement[];
}