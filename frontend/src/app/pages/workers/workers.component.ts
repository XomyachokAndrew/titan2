import { ChangeDetectorRef, Component, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { ModalWorkerComponent } from '@components/workerModalWindow/workerModalWindow.component';
import { tuiDialog } from '@taiga-ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkerService } from '@controllers/worker.service';
import { catchError, of } from 'rxjs';
import { IWorkerDetail } from '@models/WorkerDetail';
import { WorkerCardComponent } from "@components/worker-card/worker-card.component";

@Component({
  selector: 'workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.scss'],
  imports: [
    WorkerCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkersComponent {
  private destroyRef = inject(DestroyRef);
  protected workers!: IWorkerDetail[];

  constructor(
    private workerService: WorkerService,
    private cdr: ChangeDetectorRef,
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
            this.workers = data
              .map(worker => ({ ...worker }))
              .sort((a, b) => a.idWorker - b.idWorker);
            this.cdr.markForCheck();
          }
        },
        error: (error) => console.error(error)
      });
  }

  openWorker(worker: IWorkerDetail) {
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
