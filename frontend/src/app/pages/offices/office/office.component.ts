import { Component, OnInit } from '@angular/core';
import { OfficeService } from '../../../services/office.service';

@Component({
  selector: 'office',
  templateUrl: './office.component.html',
  styleUrl: './office.scss'
})
export class OfficeComponent implements OnInit {
  data: any;

  constructor (private officeService: OfficeService) {}

  ngOnInit(): void {
    this.officeService.getData().subscribe(
      response => {
        this.data = response;
        console.log(response);
      },
      error => {
        console.error(error);
      }
    );
  }
}