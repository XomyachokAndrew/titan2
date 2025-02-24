import { Component, DestroyRef, inject } from '@angular/core';
import { ModalWorkerComponent } from '../../components/workerModalWindow/workerModalWindow.component';
import { tuiDialog } from '@taiga-ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  workers: Employee[] = [
    {
      firstName: 'Андрей',
      lastName: 'Кузьмин',
      middleName: 'Игоревич',
      place: 'Офис',
      position: 'АХО',
      organization: 'Менеджер',
    }
  ];

  private readonly dialog = tuiDialog(ModalWorkerComponent, {
    dismissible: true,
    size: 'auto',
  });

  openWorker() {
    this.dialog('')
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
