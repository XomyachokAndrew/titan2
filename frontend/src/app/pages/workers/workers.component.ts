import { Component, DestroyRef, inject } from '@angular/core';
import { ModalWorkerComponent } from '@components/workerModalWindow/workerModalWindow.component';
import { tuiDialog } from '@taiga-ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkerService } from '@controllers/worker.service';
import { catchError, of } from 'rxjs';
import { IWorkerDetail } from '@models/WorkerDetail';

interface Employee {
  firstName: string;
  lastName: string;
  middleName: string;
  place: string;
  position: string;
  organization: string;
}

@Component({
  selector: 'workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.scss'],
})
export class WorkersComponent {
  private destroyRef = inject(DestroyRef);
  protected workers!: IWorkerDetail[];

  constructor (
    private workerService: WorkerService
  ) {
    this.loadWorkers();
  }

  private readonly dialog = tuiDialog(ModalWorkerComponent, {
    dismissible: true,
    size: 'auto',
  });

  async loadWorkers() {
    this.workerService.getWorkers()
    .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных работников: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.workers = data.map(worker => ({ ...worker }));
          }
        },
        error: (error) => console.error(error)
      });
  }

  openWorker(id: number) {
    this.dialog(this.workers[id-1])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          console.info(`Dialog emitted data = ${data}`);
        },
        complete: () => {
          console.info('Dialog closed');
        },
      });
  }
}
