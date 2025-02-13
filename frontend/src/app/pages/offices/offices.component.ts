import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import CardComponent from '../../components/card/card.component';
import { OfficeService } from '../../services/controllers/office.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IOfficeDto } from '../../services/models/DTO';
import LoadingComponent from '../../components/loading/loading.component';

@Component({
  selector: 'offices',
  imports: [
    CardComponent,
    LoadingComponent
  ],
  templateUrl: './offices.component.html',
  styleUrl: './offices.scss'
})
export class OfficesComponent implements OnInit {
  isLoading: boolean = true;
  data!: IOfficeDto[];
  private destroyRef = inject(DestroyRef);

  constructor (private officeService: OfficeService) {}

  ngOnInit(): void {
    this.officeService.getOffices()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      response => {
        this.isLoading = false;
        this.data = response;
      },
      error => {
        console.error(error);
      }
    );
  }
}
