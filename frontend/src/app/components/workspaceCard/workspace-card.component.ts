import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiIconPipe } from '@taiga-ui/core';
import { ICurrentWorkspace } from '@models/CurrentWorkspace';
import { CommonModule } from '@angular/common';

/**
 * Компонент для отображения карточки рабочего пространства.
 * Позволяет отображать информацию о текущем рабочем пространстве и обрабатывать события кликов и удаления.
 */
@Component({
  selector: 'workspace-card',
  templateUrl: './workspace-card.component.html',
  imports: [TuiIconPipe, CommonModule],
  styleUrls: ['./worker.scss'],
})
export class WorkspaceCardComponent {
  /**
   * Входной параметр для передачи данных о текущем рабочем пространстве.
   */
  @Input() currentWorkspace!: ICurrentWorkspace;

  /**
   * Входной параметр для определения режима редактирования.
   */
  @Input() isEdit: boolean = false;

  /**
   * Выходной параметр для передачи события клика по карточке рабочего пространства.
   */
  @Output() workerClicked = new EventEmitter<ICurrentWorkspace>();

  /**
   * Выходной параметр для передачи события удаления рабочего пространства.
   */
  @Output() deleteClicked = new EventEmitter<ICurrentWorkspace>();

  constructor() {}

  /**
   * Метод для обработки события клика по карточке рабочего пространства.
   * Вызывает событие workerClicked и передает данные о текущем рабочем пространстве.
   */
  onClick() {
    this.workerClicked.emit(this.currentWorkspace);
  }

  /**
   * Метод для обработки события удаления рабочего пространства.
   * Вызывает событие deleteClicked и передает данные о текущем рабочем пространстве.
   */
  deleteWorkspace() {
    this.deleteClicked.emit(this.currentWorkspace);
  }
}
