export interface IRentalAgreement {
    idRentalAgreement: number;
    startDate: string;
    endDate?: string;
    price: number;
    document?: string;
    idOffice: number;
    idUser: number;
}