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
import { IRoom } from '../../services/models/Room';
import { WorkspaceService } from '../../services/controllers/workspace.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';
import { IStatusWorkspaceDto } from '../../services/models/DTO';
import { IHistoryWorkspaceStatus } from '../../services/models/HistoryWorkspaceStatus';
import { DatePipe } from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { WorkerService } from '../../services/controllers/worker.service';
import { IWorker } from '../../services/models/Worker';
import { PostService } from '../../services/controllers/post.service';
import { IPost } from '../../services/models/Post';
import { DepartmentService } from '../../services/controllers/department.service';
import { IDepartment } from '../../services/models/Department';

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
    DatePipe,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
  templateUrl: './modalWindow.component.html',
  styleUrls: ['./modalWindow.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })],
})
export class ModalComponent {
  //#region Variables
  form: FormGroup;
  private initialFormValue: any;
  private readonly dialogs = inject(TuiDialogService);
  protected isEditMode = false;
  protected items = [10, 50, 100];
  private destroyRef = inject(DestroyRef);
  selectedWorkerId: number = 0;
  selectedPostId: number = 0;
  selectedDepartmentId: number = 0;
  //#region Use Interfaces
  protected value: IRoom | null = null;
  protected workspaces!: ICurrentWorkspace[];
  protected workers!: IWorker[];
  protected posts!: IPost[];
  protected departments!: IDepartment[];
  protected historyWorkspace!: IHistoryWorkspaceStatus[];
  //#endregion
  //#endregion

  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private workerService: WorkerService,
    private postService: PostService,
    private departmentService: DepartmentService
  ) {
    this.form = this.fb.group({
      idStatusWorkspace: [{ value: 0 }],
      worker: [{ value: "Работник", disabled: true }, Validators.required], // Для работника
      position: [{ value: 'Должность', disabled: true }], // Для менеджера
      organization: [{ value: 'Организация', disabled: true }], // Для организации
      status: [{ value: "Статус", disabled: true }, Validators.required], // Для статуса
      dateRange: [{
        value: new TuiDayRange(new TuiDay(2018, 2, 10), new TuiDay(2018, 3, 20)),
        disabled: true
      }, Validators.required]
    });

    this.initialFormValue = this.form.value

    this.loadWorkspaces(this.data.idRoom);
    this.loadWorkers();
    this.loadPost();
    this.loadDepartment();

    this.form.get('worker')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedWorker = this.workers.find(worker => 
          `${worker.surname} ${worker.name} ${worker.patronymic}` === selectedValue
        );
        if (selectedWorker) {
          this.selectedWorkerId = selectedWorker.idWorker
          // console.log('Worker ', this.selectedWorkerId);
        }
      }
    });

    this.form.get('position')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedPost = this.posts.find(post => post.name === selectedValue);
        if (selectedPost) {
          this.selectedPostId = selectedPost.idPost;
          // console.log('Post ', this.selectedPostId);
        }
      }
    });

    this.form.get('organization')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedDepartment = this.departments.find(department => department.name === selectedValue);
        if (selectedDepartment) {
          this.selectedDepartmentId = selectedDepartment.idDepartment;
          // console.log('Department ', this.selectedDepartmentId);
        }
      }
    });

    // this.form.get('status')?.valueChanges.subscribe({
    //   next: (selectedValue) => {
    //     // const selectedStatus
    //   }
    // })
  }
  //#endregion

  public readonly context = injectContext<TuiDialogContext<IRoom, IRoom>>();

  protected get data(): IRoom {
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

  onWorkerClicked(workspace: ICurrentWorkspace) {
    this.loadData(workspace.idWorkspace, workspace);
  }

  //#region load data from database
  async loadWorkspaces(id: number) {
    this.workspaceService.getWorkspacesByRoom(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о рабочих местах: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.workspaces = data;
          }
        }
      });
  }

  async loadWorkers() {
    this.workerService.getWorkers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о рабочих: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.workers = data;
          }
        }
      });
  }

  async loadPost() {
    this.postService.getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о должностях: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.posts = data;
          }
        }
      });
  }

  async loadDepartment() {
    this.departmentService.getDepartments()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных об отделах: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.departments = data;
          }
        }
      });
  }

  async loadWorkspace(id: number, workspace: ICurrentWorkspace) {
    this.workspaceService.getWorkspaceInfo(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о рабочем месте: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            const startDate = this.parseDateString(workspace.startDate);
            const endDate = workspace.endDate ? this.parseDateString(workspace.endDate) : startDate;
            this.form.patchValue({
              idStatusWorkspace: workspace.idStatusWorkspace,
              idWorker: workspace.idWorker,
              worker: data.workerDetails.fullWorkerName,
              position: data.workerDetails.postName,
              organization: data.workerDetails.departmentName,
              status: data.statusName,
              dateRange: new TuiDayRange(
                startDate,
                endDate
              )
            });
          }
        }
      });
  }

  async loadHistoryWorkspace(id: number) {
    this.workspaceService.getWorkspaceHistory(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных об истории рабочего места: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.historyWorkspace = data;
          }
        }
      });
  }

  async loadData(id: number, workspace: ICurrentWorkspace) {
    await this.loadHistoryWorkspace(id);
    await this.loadWorkspace(id, workspace);
  }
  //#endregion

  //#region Post data into database
  postStatusWorkspace(workspace: IStatusWorkspaceDto) {
    this.workspaceService.addStatusWorkspace(workspace)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о рабочих местах: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            console.log(data);
          }
        },
        error: (error) => console.error(error)
      });
  }
  //#endregion

  //#region Methods
  saveClick() {
    if (this.form.invalid) {
      console.error('Ошибка валидации');
    }

    const formData = this.form.value;
    const startDate = this.formatISODateToYMD(formData.dateRange.from.toLocalNativeDate().toISOString());
    let endDate: string | null = this.formatISODateToYMD(formData.dateRange.to.toLocalNativeDate().toISOString());
    if (startDate === endDate) {
      endDate = null;
    }

    const workspaceData: IStatusWorkspaceDto = {
      startDate: startDate,
      endDate: endDate,
      idStatusWorkspace: formData.idStatusWorkspace,
      idWorker: this.selectedWorkerId,
      idWorkspaceStatusType: 1,
      idUser: 1,
      idWorkspacesReservationsStatuses: 1,
    }
    console.log(workspaceData);

    this.postStatusWorkspace(workspaceData);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode; // Переключаем флаг

    if (this.isEditMode) {
      // Включаем все поля формы
      this.form.get('worker')?.enable();
      this.form.get('position')?.enable();
      this.form.get('organization')?.enable();
      this.form.get('status')?.enable();
      this.form.get('dateRange')?.enable();
    } else {
      // Отключаем поля формы
      this.form.get('worker')?.disable();
      this.form.get('position')?.disable();
      this.form.get('organization')?.disable();
      this.form.get('status')?.disable();
      this.form.get('dateRange')?.disable();
    }
  }

  clearClick(): void {
    this.form.reset(this.initialFormValue); // Сбрасываем форму до исходных значений
    this.form.disable();
    if (this.isEditMode) {
      this.form.enable();
    }
  }

  private parseDateString(dateString: string = ""): TuiDay {
    const date = new Date(dateString);
    return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private formatISODateToYMD(isoDateString: string): string {
    // Создаем объект даты из строки в формате ISO
    const date = new Date(isoDateString);
  
    // Проверяем, что дата корректна
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
  
    // Получаем компоненты даты
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const day = String(date.getUTCDate()).padStart(2, '0');
  
    // Формируем строку в формате "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  }
  //#endregion
}
