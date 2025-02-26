import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TuiIconPipe } from '@taiga-ui/core';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'worker',
  templateUrl: './worker.component.html',
  imports: [TuiIconPipe, CommonModule],
  styleUrls: ['./worker.scss'],
})
export class WorkerComponent /*implements OnChanges*/ {
  @Input() currentWorkspace!: ICurrentWorkspace;
  @Input() isEdit: boolean = false;
  @Output() workerClicked = new EventEmitter<ICurrentWorkspace>();

  constructor() { }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['currentWorkspace']) {
  //     // console.log('Данные обновлены:', this.currentWorkspace);
  //   }
  // }

  onClick() {
    this.workerClicked.emit(this.currentWorkspace);
  }
}
