import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OfficeDataService {
    private dataOffice = {
        title: "", 
        address: "", 
        countCab: 0, 
        countWorkspace: 0,
        countAvaibleWorkspace: 0
    }
    
    
    public setData(
        title: string, 
        address: string, 
        countCab: number, 
        countWorkspace: number,
        countAvaibleWorkspace: number
    ) {
        this.dataOffice = {
            title: title,
            address: address,
            countCab: countCab,
            countWorkspace: countWorkspace,
            countAvaibleWorkspace: countAvaibleWorkspace
        }
    }

    public getData() {
        return this.dataOffice;
    }
}