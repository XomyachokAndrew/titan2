import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { IWorkerDetail } from '@models/WorkerDetail';

@Component({
  selector: 'worker-card',
  standalone: true,
  imports: [
  ],
  templateUrl: './worker-card.component.html',
  styleUrls: ['./worker-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerCardComponent {
  @Input() worker!: IWorkerDetail;
  @Output() workerClicked = new EventEmitter<IWorkerDetail>();

  openWorker() {
    this.workerClicked.emit(this.worker);
  }
}
