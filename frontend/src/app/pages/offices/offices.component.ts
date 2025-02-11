import { Component, OnInit } from '@angular/core';
import CardComponent from '../../components/card/card.component';
import { OfficeService } from '../../services/controllers/office.service';

@Component({
  selector: 'offices',
  imports: [CardComponent],
  templateUrl: './offices.component.html',
  styleUrl: './offices.scss'
})
export class OfficesComponent implements OnInit {
  data: any;

  constructor (private officeService: OfficeService) {}

  ngOnInit(): void {
    this.officeService.getOffices().subscribe(
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
