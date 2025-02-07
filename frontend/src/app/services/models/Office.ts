export interface Office {
    IdOffice: number;
    OfficeName: string;
    Address: string;
    IdOfficeStatus: number;
    Square?: number;
    Image: string;
    TotalWorkspace?: number;
    // Floors: Floor[];
    // IdOfficeStatusNavigation: OfficesStatus;
    // RentalAgreements: RentalAgreement[];
}