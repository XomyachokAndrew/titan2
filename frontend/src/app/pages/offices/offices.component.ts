import { Component, OnInit } from '@angular/core';
import CardComponent from '../../components/card/card.component';
import { OfficeService } from '../../services/office.service';

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
