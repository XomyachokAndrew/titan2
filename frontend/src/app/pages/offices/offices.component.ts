import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import CardComponent from '../../components/card/card.component';
import { OfficeService } from '../../services/controllers/office.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'offices',
  imports: [CardComponent],
  templateUrl: './offices.component.html',
  styleUrl: './offices.scss'
})
export class OfficesComponent implements OnInit {
  data: any;
  private destroyRef = inject(DestroyRef);

  constructor (private officeService: OfficeService) {}

  ngOnInit(): void {
    this.officeService.getOffices()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      response => {
        this.data = response;
      },
      error => {
        console.error(error);
      }
    );
  }
}
