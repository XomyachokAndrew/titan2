import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiIconPipe } from '@taiga-ui/core';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'worker',
  templateUrl: './worker.component.html',
  imports: [TuiIconPipe, CommonModule],
  styleUrls: ['./worker.scss'],
})
export class WorkerComponent {
  @Input() currentWorkspace!: ICurrentWorkspace;
  @Input() isEdit: boolean = false;
  @Output() workerClicked = new EventEmitter<ICurrentWorkspace>();

  constructor() { }

  onClick() {
    this.workerClicked.emit(this.currentWorkspace);
  }
}
