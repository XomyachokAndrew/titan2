//#region IMPORTS
import { ChangeDetectorRef, TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type { TuiDialogContext } from '@taiga-ui/core';
import { TuiDialogService, TuiTextfield } from '@taiga-ui/core';
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
import { IRoomDto, IStatusWorkspaceDto } from '../../services/models/DTO';
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
import { WorkersStatusesTypeService } from '../../services/controllers/workersStatusesType.service';
import { IWorkersStatusesType } from '../../services/models/WorkersStatusesType';
import { IWorkerDetail } from '../../services/models/WorkerDetail';
//#endregion
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
  private readonly dialogs = inject(TuiDialogService);
  protected isEditMode = false;
  protected items = [10, 50, 100];
  private destroyRef = inject(DestroyRef);
  selectedWorkerId: number = 0;
  selectedPostId: number = 0;
  selectedDepartmentId: number = 0;
  selectedStatusId: number = 0;
  //#region Use Interfaces
  protected value: IRoomDto | null = null;
  protected workspaces!: ICurrentWorkspace[];
  protected workers!: IWorkerDetail[];
  protected posts!: IPost[];
  protected departments!: IDepartment[];
  protected historyWorkspace!: IHistoryWorkspaceStatus[];
  protected workersStatuseTypes!: IWorkersStatusesType[];
  //#endregion
  //#endregion

  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private workerService: WorkerService,
    private postService: PostService,
    private departmentService: DepartmentService,
    private WorkersStatusesTypeService: WorkersStatusesTypeService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      idWorkspace: [{ value: 0 }],
      idStatusWorkspace: [{ value: 0 }],
      worker: [{ value: '', disabled: true }, Validators.required], // Для работника
      position: [{ value: '', disabled: true }], // Для менеджера
      organization: [{ value: '', disabled: true }], // Для организации
      status: [{ value: '', disabled: true }, Validators.required], // Для статуса
      dateRange: [{
        value: null,
        disabled: true
      }, Validators.required]
    });

    this.loadWorkspaces(this.data.idRoom);
    this.loadWorkers();
    this.loadPost();
    this.loadDepartment();
    this.loadWorkersStatusesType();

    this.getForms();
  }
  //#endregion

  //#region DialogData
  public readonly context = injectContext<TuiDialogContext<IRoomDto, IRoomDto>>();

  protected get data(): IRoomDto {
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
  //#endregion

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
            this.cdr.markForCheck();
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
              idWorkspace: id,
              idStatusWorkspace: workspace.idStatusWorkspace,
              idWorker: workspace.idWorker,
              worker: data.workerDetails?.fullWorkerName,
              position: data.workerDetails?.postName,
              organization: data.workerDetails?.departmentName,
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

  async loadWorkersStatusesType() {
    this.WorkersStatusesTypeService.getWorkersStatusesTypes()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о типах рабочих: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.workersStatuseTypes = data;
          }
        }
      });
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
            this.loadWorkspaces(this.data.idRoom);
            this.loadWorkers();
            this.loadPost();
            this.loadDepartment();
            this.cdr.markForCheck();
          }
        },
        error: (error) => console.error(error)
      });
  }
  //#endregion

  //#region Methods
  onWorkerClicked(workspace: ICurrentWorkspace) {
    this.loadData(workspace.idWorkspace, workspace);
  }

  getForms() {
    this.form.get('worker')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedWorker = this.workers.find(worker =>
          `${worker.fullWorkerName}` === selectedValue
        );
        if (selectedWorker) {
          this.selectedWorkerId = selectedWorker.idWorker
        }
      }
    });

    this.form.get('position')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedPost = this.posts.find(post => post.name === selectedValue);
        if (selectedPost) {
          this.selectedPostId = selectedPost.idPost;
        }
      }
    });

    this.form.get('organization')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedDepartment = this.departments.find(department => department.name === selectedValue);
        if (selectedDepartment) {
          this.selectedDepartmentId = selectedDepartment.idDepartment;
        }
      }
    });

    this.form.get('status')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedStatus = this.workersStatuseTypes.find(wSt => wSt.name === selectedValue);
        if (selectedStatus) {
          this.selectedStatusId = selectedStatus.idStatus;
        }
      }
    })
  }

  saveClick() {
    if (this.form.invalid) {
      console.error('Ошибка валидации');
    }

    const formData = this.form.value;
    const startDate = this.formatISODateToYMD(formData.dateRange.from.toLocalNativeDate().toISOString());
    let endDate: string | null = this.formatISODateToYMD(formData.dateRange.to.toLocalNativeDate().toISOString());
    if (startDate === endDate) {
      endDate = '';
    }

    const workspaceData: IStatusWorkspaceDto = {
      idWorkspace: formData.idWorkspace,
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
    let initialValue = this.fb.group({
      idStatusWorkspace: this.form.value.idStatusWorkspace,
      worker: [{ value: "Работник", disabled: true }, Validators.required], // Для работника
      position: [{ value: 'Должность', disabled: true }], // Для менеджера
      organization: [{ value: 'Организация', disabled: true }], // Для организации
      status: [{ value: "Статус", disabled: true }, Validators.required], // Для статуса
      dateRange: [{
        value: null,
        disabled: true
      }, Validators.required]
    }).value;
    this.form.reset(initialValue); // Сбрасываем форму до исходных значений
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

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  //#endregion
}
