import { Component, Input } from '@angular/core';
import { TuiIcon, TuiIconPipe } from '@taiga-ui/core';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';

@Component({
  selector: 'worker',
  templateUrl: './worker.component.html',
  imports: [TuiIcon, TuiIconPipe],
  styleUrls: ['./worker.scss'],
})
export class WorkerComponent {
  @Input() currentWorkspace!: ICurrentWorkspace;
  constructor() { }
}
