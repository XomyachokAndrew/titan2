import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ModalWorkerComponent } from '@components/workerModalWindow/workerModalWindow.component';
import { tuiDialog } from '@taiga-ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkerService } from '@controllers/worker.service';
import { catchError, of } from 'rxjs';
import { IWorkerDetail } from '@models/WorkerDetail';
import { WorkerCardComponent } from '@components/worker-card/worker-card.component';
import { Router } from '@angular/router';
import { UserService } from '@controllers/user.service';

/**
 * Компонент для отображения списка работников.
 * Позволяет загружать данные о работниках и открывать модальное окно для просмотра и редактирования информации о работнике.
 */
@Component({
  selector: 'workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.scss'],
  imports: [WorkerCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkersComponent {
  private destroyRef = inject(DestroyRef);
  protected workers!: IWorkerDetail[];
  protected isAdmin: boolean = false;

  /**
   * Конструктор компонента.
   *
   * @param workerService - Сервис для работы с данными о работниках.
   * @param cdr - Сервис для управления изменениями.
   * @param router - Сервис для маршрутизации.
   * @param authService - Сервис для работы с аутентификацией пользователя.
   */
  constructor(
    private workerService: WorkerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: UserService
  ) {
    this.loadWorkers();
  }

  /**
   * Диалоговое окно для отображения информации о работнике.
   */
  private readonly dialog = tuiDialog(ModalWorkerComponent, {
    dismissible: true,
    size: 'auto',
  });

  /**
   * Метод для загрузки данных о работниках.
   */
  async loadWorkers() {
    this.workerService
      .getWorkers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных работников: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.workers = data
              .map(worker => ({ ...worker }))
              .sort((a, b) => a.idWorker - b.idWorker);
            this.cdr.markForCheck();
          }
        },
        error: error => console.error(error),
      });
  }

  /**
   * Метод для открытия модального окна с информацией о работнике.
   *
   * @param worker - Данные о работнике.
   */
  openWorker(worker: IWorkerDetail) {
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      console.log(this.isAdmin);

      return;
    }
    this.dialog(worker)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          console.info(`Dialog emitted data = ${data}`);
        },
        complete: () => {
          console.info('Dialog closed');
          this.loadWorkers();
          this.cdr.markForCheck();
        },
      });
  }
}
