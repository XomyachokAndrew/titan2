import {
  Component,
} from '@angular/core';
import {TuiIcon, TuiIconPipe} from '@taiga-ui/core';

@Component({
  selector: 'worker',
  templateUrl: './worker.component.html',
  imports: [TuiIcon, TuiIconPipe],
  styleUrls: ['./worker.scss'],
})
export class WorkerComponent   {
 
  constructor(
  ) {}
}
