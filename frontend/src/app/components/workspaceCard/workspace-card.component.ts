import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiIconPipe } from '@taiga-ui/core';
import { ICurrentWorkspace } from '@models/CurrentWorkspace';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'workspace-card',
  templateUrl: './workspace-card.component.html',
  imports: [TuiIconPipe, CommonModule],
  styleUrls: ['./worker.scss'],
})
export class WorkspaceCardComponent{
  @Input() currentWorkspace!: ICurrentWorkspace;
  @Input() isEdit: boolean = false;
  @Output() workerClicked = new EventEmitter<ICurrentWorkspace>();

  constructor() { }

  onClick() {
    this.workerClicked.emit(this.currentWorkspace);
  }
}
