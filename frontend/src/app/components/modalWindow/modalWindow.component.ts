import type { TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import type { TuiDialogContext } from '@taiga-ui/core';
import { TuiButton, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSlider } from '@taiga-ui/kit';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { tuiDateFormatProvider } from '@taiga-ui/core';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { WorkerComponent } from '../workerCard/worker.component';
import { TuiScrollbar } from '@taiga-ui/core';
import {
  TuiInputModule,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiInputModule,
    TuiSelectModule,
    TuiSlider,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiInputDateRangeModule,
    WorkerComponent,
    TuiScrollbar,
  ],
  templateUrl: './modalWindow.component.html',
  styleUrls: ['./modalWindow.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })],
})
export class ModalComponent {
  form: FormGroup; // Объявляем FormGroup
  private readonly dialogs = inject(TuiDialogService);
  protected readonly disable = signal(true);
  protected value: number | null = null;
  protected name = '';
  protected items = [10, 50, 100];
  protected dateRangeItems: Array<{ label: string; value: TuiDayRange }> = [
    {
      label: 'Last 7 days',
      value: new TuiDayRange(new TuiDay(2023, 9, 1), new TuiDay(2023, 9, 7)),
    },
    {
      label: 'Last 30 days',
      value: new TuiDayRange(new TuiDay(2023, 8, 1), new TuiDay(2023, 9, 1)),
    },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      worker: [null, Validators.required], // Для работника
      manager: [{ value: '', disabled: true }], // Для менеджера
      organization: [{ value: '', disabled: true }], // Для организации
      status: [null, Validators.required], // Для статуса
      dateRange: new FormControl(
        new TuiDayRange(new TuiDay(2018, 2, 10), new TuiDay(2018, 3, 20)),
        Validators.required
      ),
    });
  }

  public readonly context = injectContext<TuiDialogContext<number, number>>();

  protected get data(): number {
    return this.context.data;
  }

  protected submit(): void {
    if (this.value !== null) {
      this.context.completeWith(this.value);
    }
  }

  protected showDialog(content: TemplateRef<TuiDialogContext>): void {
    this.dialogs.open(content, { dismissible: true }).subscribe();
  }
}
