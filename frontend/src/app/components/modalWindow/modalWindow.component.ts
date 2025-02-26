import { ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiDialogContext } from '@taiga-ui/core';
import { TuiTextfield, TuiScrollbar } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSlider } from '@taiga-ui/kit';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { tuiDateFormatProvider } from '@taiga-ui/core';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import { WorkerComponent } from '../workerCard/worker.component';
import {
  TuiInputModule,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { WorkspaceService } from '../../services/controllers/workspace.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { IRoomDto, IStatusWorkspaceDto, IWorkspaceInfoDto } from '../../services/models/DTO';
import { IHistoryWorkspaceStatus } from '../../services/models/HistoryWorkspaceStatus';
import { DatePipe } from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { WorkerService } from '../../services/controllers/worker.service';
import { PostService } from '../../services/controllers/post.service';
import { IPost } from '../../services/models/Post';
import { DepartmentService } from '../../services/controllers/department.service';
import { IDepartment } from '../../services/models/Department';
import { WorkersStatusesTypeService } from '../../services/controllers/workersStatusesType.service';
import { IWorkersStatusesType } from '../../services/models/WorkersStatusesType';
import { IWorkerDetail } from '../../services/models/WorkerDetail';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';

/**
 * Компонент модального окна для управления рабочими местами.
 * Позволяет просматривать, редактировать и сохранять информацию о рабочих местах,
 * а также управлять связанными данными (работники, должности, отделы и т.д.).
 */
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
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly workerService = inject(WorkerService);
  private readonly postService = inject(PostService);
  private readonly departmentService = inject(DepartmentService);
  private readonly workerStatusTypeService = inject(WorkersStatusesTypeService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  protected form: FormGroup;
  protected isEditMode: boolean = false;
  protected workspaces: ICurrentWorkspace[] = [];
  protected workers: IWorkerDetail[] = [];
  protected posts: IPost[] = [];
  protected departments: IDepartment[] = [];
  protected workerStatusTypes: IWorkersStatusesType[] = [];
  protected historyWorkspace: IHistoryWorkspaceStatus[] = [];
  protected selectedWorkerId: number = 0;
  protected selectedPostId: number = 0;
  protected selectedDepartmentId: number = 0;

  public readonly context = injectContext<TuiDialogContext<IRoomDto, IRoomDto>>();

  constructor() {
    this.form = this.fb.group({
      idWorkspace: [{ value: 0, disabled: false }],
      idStatusWorkspace: [{ value: 0, disabled: false }],
      worker: [{ value: null, disabled: true }],
      post: [{ value: null, disabled: true }],
      department: [{ value: null, disabled: true }],
      status: [{ value: null, disabled: true }],
      dateRange: [{ value: null, disabled: true }],
    });

    this.loadInitialData();
    this.setupFormListeners();
  }

  /**
   * Загружает начальные данные (рабочие места и выпадающие списки).
   */
  private loadInitialData(): void {
    this.loadWorkspaces(this.data.idRoom);
    this.loadSelects();
  }

  /**
   * Настраивает слушатели изменений значений формы.
   */
  private setupFormListeners(): void {
    this.form.get('worker')?.valueChanges.subscribe((selectedValue) => {
      const selectedWorker = this.workers.find(worker => `${worker.fullWorkerName}` === selectedValue);
      if (selectedWorker) {
        this.selectedWorkerId = selectedWorker.idWorker;
        this.loadWorker(this.selectedWorkerId);
      }
    });

    this.form.get('position')?.valueChanges.subscribe((selectedValue) => {
      const selectedPost = this.posts.find(post => post.name === selectedValue);
      if (selectedPost) {
        this.selectedPostId = selectedPost.idPost;
      }
    });

    this.form.get('organization')?.valueChanges.subscribe((selectedValue) => {
      const selectedDepartment = this.departments.find(department => department.name === selectedValue);
      if (selectedDepartment) {
        this.selectedDepartmentId = selectedDepartment.idDepartment;
      }
    });
  }

  /**
   * Возвращает данные, переданные в модальное окно.
   */
  protected get data(): IRoomDto {
    return this.context.data;
  }

  /**
   * Загружает рабочие места для указанной комнаты.
   * @param id - Уникальный идентификатор комнаты.
   */
  private loadWorkspaces(id: number): void {
    this.workspaceService.getWorkspacesByRoom(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке рабочих мест:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.workspaces = data;
          this.cdr.markForCheck();
        },
        error: (err) => console.error(err)
      });
  }

  /**
   * Загружает данные для выпадающих списков (работники, должности, отделы, статусы).
   */
  private async loadSelects(): Promise<void> {
    await Promise.all([
      this.loadWorkers(),
      this.loadPosts(),
      this.loadDepartments(),
      this.loadWorkerStatusTypes(),
    ]);
  }

  /**
   * Загружает список работников.
   */
  private loadWorkers(): void {
    this.workerService.getWorkers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке работников:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => this.workers = data,
        error: (err) => console.error(err)
      });
  }

  /**
   * Загружает список должностей.
   */
  private loadPosts(): void {
    this.postService.getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке должностей:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => this.posts = data,
        error: (err) => console.error(err)
      });
  }

  /**
   * Загружает список отделов.
   */
  private loadDepartments(): void {
    this.departmentService.getDepartments()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке отделов:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => this.departments = data,
        error: (err) => console.error(err)
      });
  }

  /**
   * Загружает список статусов работников.
   */
  private loadWorkerStatusTypes(): void {
    this.workerStatusTypeService.getWorkersStatusesTypes()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке статусов работников:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => this.workerStatusTypes = data,
        error: (err) => console.error(err)
      });
  }

  /**
   * Отправляет данные формы на сервер.
   */
  protected onSubmit(): void {
    if (this.form.invalid) {
      console.error('Ошибка валидации');
      return;
    }

    const formData = this.form.value;

    if (!formData.dateRange?.from || !formData.dateRange?.to) {
      console.error('Диапазон дат не заполнен.');
      return;
    }

    const startDate = this.formatISODateToYMD(formData.dateRange.from.toLocalNativeDate().toISOString());
    const endDate = this.formatISODateToYMD(formData.dateRange.to.toLocalNativeDate().toISOString());

    const idStatusWorkspace = formData.idStatusWorkspace ?? 0;

    if (formData.idWorkspace !== undefined && this.selectedWorkerId !== undefined) {
      const workspaceData: IStatusWorkspaceDto = {
        idWorkspace: formData.idWorkspace,
        startDate: startDate,
        endDate: startDate === endDate ? '' : endDate,
        idStatusWorkspace: idStatusWorkspace,
        idWorker: this.selectedWorkerId,
        idWorkspaceStatusType: 1,
        idUser: 1,
        idWorkspacesReservationsStatuses: 1,
      };

      this.postWorkspaceStatus(workspaceData);
    } else {
      console.error('Некоторые обязательные поля формы не заполнены.');
    }
  }

  /**
   * Отправляет данные о статусе рабочего места на сервер.
   * @param statusWorkspaceDto - Данные о статусе рабочего места.
   */
  private postWorkspaceStatus(statusWorkspaceDto: IStatusWorkspaceDto): void {
    this.workspaceService.addStatusWorkspace(statusWorkspaceDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при отправке данных:', error);
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.loadWorkspaces(this.data.idRoom);
          this.loadSelects();
          this.historyWorkspace = [];
          this.form.reset();
          this.cdr.markForCheck();
        },
        error: (error) => console.error(error)
      });
  }

  /**
   * Очищает форму.
   */
  protected clearClick(): void {
    this.form.reset();
  }

  /**
   * Загружает историю изменений рабочего места.
   * @param id - Уникальный идентификатор рабочего места.
   */
  protected async loadWorkspaceHistory(id: number): Promise<void> {
    this.workspaceService.getWorkspaceHistory(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке истории:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.historyWorkspace = data;
          this.cdr.markForCheck();
        },
        error: (err) => console.error(err)
      });
  }

  /**
   * Загружает подробную информацию о рабочем месте.
   * @param workspace - Выбранное рабочее место.
   */
  protected async loadWorkspaceInfo(workspace: ICurrentWorkspace): Promise<void> {
    this.workspaceService.getWorkspaceInfo(workspace.idWorkspace)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке информации:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.patchForm(data, workspace);
            this.cdr.markForCheck();
          }
        },
        error: (err) => console.error(err)
      });
  }

  /**
   * Обновляет данные формы на основе информации о рабочем месте.
   * @param workspaceInfo - Подробная информация о рабочем месте.
   * @param currentWorkspace - Выбранное рабочее место.
   */
  private patchForm(workspaceInfo: IWorkspaceInfoDto, currentWorkspace: ICurrentWorkspace): void {
    const startDate = this.parseDateString(currentWorkspace.startDate);
    const endDate = currentWorkspace.endDate ? this.parseDateString(currentWorkspace.endDate) : startDate;

    this.form.patchValue({
      idWorkspace: currentWorkspace.idWorkspace,
      idStatusWorkspace: currentWorkspace.idStatusWorkspace,
      worker: currentWorkspace.fullWorkerName,
      post: workspaceInfo.workerDetails?.postName || null,
      department: workspaceInfo.workerDetails?.departmentName || null,
      status: workspaceInfo.statusName || null,
      dateRange: new TuiDayRange(startDate, endDate),
    });
  }

  /**
   * Обрабатывает клик по карточке работника.
   * @param workspace - Выбранное рабочее место.
   */
  protected async onWorkerClicked(workspace: ICurrentWorkspace): Promise<void> {
    if (!this.cdr) {
      console.error('ChangeDetectorRef is not defined');
      return;
    }

    await this.loadWorkspaceInfo(workspace);
    await this.loadWorkspaceHistory(workspace.idWorkspace);
    this.cdr.markForCheck();
  }

  /**
   * Загружает данные о работнике и обновляет форму.
   * @param id - Уникальный идентификатор работника.
   */
  private loadWorker(id: number): void {
    this.workerService.getWorker(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при загрузке данных работника:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.form.patchValue({
              post: data.postName,
              department: data.departmentName,
              status: data.statusName,
            });
            this.cdr.markForCheck();
          }
        },
        error: (err) => console.error(err)
      });
  }

  /**
   * Переключает режим редактирования формы.
   */
  protected toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    const fields = ['worker', 'status', 'dateRange'];
    fields.forEach(field => {
      const control = this.form.get(field);
      if (control) {
        this.isEditMode ? control.enable() : control.disable();
      }
    });
  }

  /**
   * Преобразует строку даты в объект TuiDay.
   * @param dateString - Строка даты.
   * @returns Объект TuiDay.
   */
  private parseDateString(dateString: string = ""): TuiDay {
    const date = new Date(dateString);
    return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Форматирует дату в формате ISO в строку формата YYYY-MM-DD.
   * @param isoDateString - Строка даты в формате ISO.
   * @returns Строка даты в формате YYYY-MM-DD.
   */
  private formatISODateToYMD(isoDateString: string): string {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
    return date.toISOString().split('T')[0];
  }
}