import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import CardComponent from '@components/card/card.component';
import { OfficeService } from '@controllers/office.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IOfficeDto } from '@DTO';
import LoadingComponent from '@components/loading/loading.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Компонент для отображения списка офисов.
 * Загружает данные об офисах и отображает их с помощью компонента CardComponent.
 */
@Component({
  selector: 'offices',
  imports: [CardComponent, LoadingComponent],
  templateUrl: './offices.component.html',
  styleUrl: './offices.scss',
})
export class OfficesComponent implements OnInit {
  isLoading: boolean = true;
  offices!: IOfficeDto[];
  private destroyRef = inject(DestroyRef);

  /**
   * Конструктор компонента.
   *
   * @param officeService - Сервис для работы с данными об офисах.
   */
  constructor(private officeService: OfficeService) {}

  /**
   * Метод, вызываемый при инициализации компонента.
   */
  ngOnInit(): void {
    this.loadOffices();
  }

  /**
   * Метод для загрузки данных об офисах.
   */
  loadOffices() {
    this.officeService
      .getOffices()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных офисов: ', error);
          return of([]);
        })
      )
      .subscribe({
        next: data => {
          this.offices = data;
          this.isLoading = false;
        },
      });
  }
}
