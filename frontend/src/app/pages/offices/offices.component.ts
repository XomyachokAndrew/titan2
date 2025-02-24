import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import CardComponent from '../../components/card/card.component';
import { OfficeService } from '../../services/controllers/office.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IOfficeDto } from '../../services/models/DTO';
import LoadingComponent from '../../components/loading/loading.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs'

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
  offices!: IOfficeDto[];
  private destroyRef = inject(DestroyRef);

  constructor(private officeService: OfficeService) { }

  ngOnInit(): void {
    this.loadOffices()
  }

  loadOffices() {
    this.officeService.getOffices()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных офисов: ', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.offices = data;
          this.isLoading = false;
        }
      });
  }
}
