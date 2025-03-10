import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { IWorkerDetail } from '@models/WorkerDetail';

/**
 * Компонент для отображения карточки работника.
 * Позволяет отображать информацию о работнике и обрабатывать события кликов по карточке.
 */
@Component({
  selector: 'worker-card',
  imports: [],
  templateUrl: './worker-card.component.html',
  styleUrls: ['./worker-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerCardComponent {
  /**
   * Входной параметр для передачи данных о работнике.
   */
  @Input() worker!: IWorkerDetail;

  /**
   * Выходной параметр для передачи события клика по карточке работника.
   */
  @Output() workerClicked = new EventEmitter<IWorkerDetail>();

  constructor() {}

  /**
   * Метод для обработки события клика по карточке работника.
   * Вызывает событие workerClicked и передает данные о работнике.
   */
  openWorker() {
    this.workerClicked.emit(this.worker);
  }
}
