import type { TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { WorkspaceService } from '../../services/controllers/workspace.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';

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
  ],
  templateUrl: './workerModalWindow.component.html',
  styleUrls: ['./workerModalWindow.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })],
})
export class ModalWorkerComponent {
  form: FormGroup; // Объявляем FormGroup
  private readonly dialogs = inject(TuiDialogService);
  protected readonly disable = signal(true);
  protected value: string | null = null;
  protected name = '';
  protected items = [10, 50, 100];
  protected workspaces!: ICurrentWorkspace[];
  private destroyRef = inject(DestroyRef);
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

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService
  ) {
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

  loadWorkspaces(id: number) {
    this.workspaceService
      .getWorkspacesByRoom(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error(
            'Ошибка при обработке данных о рабочих местах: ',
            error
          );
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.workspaces = data;
          }
        },
      });
  }

  public readonly context = injectContext<TuiDialogContext<string, string>>();

  protected get data(): string {
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
