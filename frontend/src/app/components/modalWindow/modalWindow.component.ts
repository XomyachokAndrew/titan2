//#region IMPORTS
import { ChangeDetectorRef, OnChanges, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
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
import { IRoomDto, IStatusWorkspaceDto, IWorkspaceInfoDto } from '../../services/models/DTO';
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

/**
 * Компонент модального окна
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
  private destroyRef = inject(DestroyRef);
  protected form: FormGroup;
  protected value!: IRoomDto;
  protected isEditMode: boolean = false;
  protected workspaces!: ICurrentWorkspace[];
  protected workers!: IWorkerDetail[];
  protected posts!: IPost[];
  protected departments!: IDepartment[];
  protected workerStatusTypes!: IWorkersStatusesType[];
  protected historyWorkspace!: IHistoryWorkspaceStatus[];
  protected worker!: IWorkerDetail;
  protected selectedWorkerId: number = 0;
  protected selectedPostId: number = 0;
  protected selectedDepartmentId: number = 0;

  constructor(
    private workspaceService: WorkspaceService,
    private workerService: WorkerService,
    private postService: PostService,
    private departmentService: DepartmentService,
    private workerStatusTypeService: WorkersStatusesTypeService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    console.log('ChangeDetectorRef initialized:', this.cdr);
    this.form = this.fb.group({
      idWorkspace: [{ value: 0, disabled: false }],
      idStatusWorkspace: [{ value: 0, disabled: false }],
      worker: [{ value: null, disabled: true }],
      post: [{ value: null, disabled: true }],
      department: [{ value: null, disabled: true }],
      status: [{ value: null, disabled: true }],
      dateRange: [{ value: null, disabled: true }],
    });

    this.loadWorkspaces(this.data.idRoom);
    this.loadSelects();

    this.form.get('worker')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedWorker = this.workers.find(worker =>
          `${worker.fullWorkerName}` === selectedValue
        );
        if (selectedWorker) {
          this.selectedWorkerId = selectedWorker.idWorker
          this.loadWorker(this.selectedWorkerId);
        }
      }
    });

    this.form.get('position')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedPost = this.posts.find(post => post.name === selectedValue);
        if (selectedPost) {
          this.selectedPostId = selectedPost.idPost;
          console.log(selectedPost);
        }
      }
    });

    this.form.get('organization')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedDepartment = this.departments.find(department => department.name === selectedValue);
        if (selectedDepartment) {
          this.selectedDepartmentId = selectedDepartment.idDepartment;
          console.log(selectedDepartment);
        }
      }
    });
  }

  public readonly context = injectContext<TuiDialogContext<IRoomDto, IRoomDto>>();

  /**
   * Данные передаваемые со страницы в модальное окно
   */
  protected get data(): IRoomDto {
    return this.context.data;
  }

  /**
   * Асинхронный метод, загружающий рабочие места по выбранной комнате
   * @param id уникальный индетификатор комнаты
   */
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
        next: data => {
          if (data) {
            this.workspaces = data.map(ws => ({ ...ws }));
            this.cdr.markForCheck();
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Асинхронныый метод, подгружающий данные из бд в selects 
   */
  async loadSelects() {
    await this.loadWorkers();
    await this.loadPosts();
    await this.loadDepartments();
    await this.loadWorkerStatusTypes();
  }

  /**
   * Асинхронный метод, для подгрузки рабочих
   */
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
        next: data => {
          if (data) {
            this.workers = data.map(worker => ({ ...worker }));
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Асинхронный метод, для подгрузки должностей
   */
  async loadPosts() {
    this.postService.getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных должностей: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.posts = data.map(post => ({ ...post }));
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Асинхронный метод, для подгрузки отделов
   */
  async loadDepartments() {
    this.departmentService.getDepartments()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных отделов: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.departments = data.map(department => ({ ...department }));
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Асинхронный метод, для подгрузки статуса рабочего
   */
  async loadWorkerStatusTypes() {
    this.workerStatusTypeService.getWorkersStatusesTypes()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных типа статуса рабочего: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.workerStatusTypes = data.map(workerStatusTypes => ({ ...workerStatusTypes }));
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Метод, отправляющий post запрос
   */
  onSubmit() {
    if (this.form.invalid) {
      console.error('Ошибка валидации');
    }

    const formData = this.form.value;
    
    if (formData.dateRange && formData.dateRange.from && formData.dateRange.to) {
      const startDate = this.formatISODateToYMD(formData.dateRange.from.toLocalNativeDate().toISOString());
      let endDate = this.formatISODateToYMD(formData.dateRange.to.toLocalNativeDate().toISOString());

      if (startDate === endDate) {
        endDate = '';
      }

      const idStatusWorkspace = (formData.idStatusWorkspace === undefined || formData.idStatusWorkspace === null) ? 0 : formData.idStatusWorkspace;

      if (formData.idWorkspace !== undefined && this.selectedWorkerId !== undefined) {
        const workspaceData = {
          idWorkspace: formData.idWorkspace,
          startDate: startDate,
          endDate: endDate,
          idStatusWorkspace: idStatusWorkspace,
          idWorker: this.selectedWorkerId,
          idWorkspaceStatusType: 1,
          idUser: 1,
          idWorkspacesReservationsStatuses: 1,
        };

        this.postWorkspaceStatus(workspaceData);
      }
      else {
        console.error('Некоторые обязательные поля формы не заполнены.');
      }
    }
    else {
      console.error('Диапазон дат не заполнен.');
    }
  }

  /**
   * Метод, отправляющий 
   */
  postWorkspaceStatus(statusWorkspaceDto: IStatusWorkspaceDto) {
    this.workspaceService.addStatusWorkspace(statusWorkspaceDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о рабочих местах: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: () => {
            this.loadWorkspaces(this.data.idRoom);
            this.loadSelects();
            this.historyWorkspace = [];
            this.form.patchValue({
              idStatusWorkspace: null,
              idWorkspace: null,
              worker: null,
              post: null,
              department: null,
              status: null,
              dateRange: null,
            });
            this.cdr.markForCheck();
        },
        error: (error) => console.error(error)
      });
  }

  /**
   * Метод, очищающий форму от данных
   */
  clearClick() {
    this.form.patchValue({
      worker: null,
      post: null,
      department: null,
      status: null,
      dateRange: null,
    });
  }

  /**
   * Асинхронный метод, для подгрузки истории рабочего места
   * @param id уникальный индетификатор рабочего места
   */
  async loadWorkspaceHistory(id: number) {
    this.workspaceService.getWorkspaceHistory(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных истории рабочего места: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.historyWorkspace = data.map(historyWorkspace => ({ ...historyWorkspace }));
            this.cdr.markForCheck();
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Асинхронный метод, для подгрузки подробной информации о выбранном рабочем месте
   * @param workspace Выбранное рабочее место
   */
  async loadWorksapceInfo(workspace: ICurrentWorkspace) {
    this.workspaceService.getWorkspaceInfo(workspace.idWorkspace)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных рабочего места: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.patchForm(data, workspace);
            this.cdr.markForCheck();
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Метод, обновляющий данные формы
   * @param workspaceInfo Подробная информация о рабочем месте
   * @param currentWorkspace Выбранное рабочее место
   */
  patchForm(workspaceInfo: IWorkspaceInfoDto, currentWorkspace: ICurrentWorkspace) {
    const startDate = this.parseDateString(currentWorkspace.startDate);
    const endDate = currentWorkspace.endDate ? this.parseDateString(currentWorkspace.endDate) : startDate;

    // Проверяем, что workspaceInfo инициализирован
    const postName = workspaceInfo.workerDetails?.postName || null;
    const departmentName = workspaceInfo.workerDetails?.departmentName || null;
    const statusName = workspaceInfo.statusName || null;

    this.form.patchValue({
      idWorkspace: currentWorkspace.idWorkspace,
      idStatusWorkspace: currentWorkspace.idStatusWorkspace,
      worker: currentWorkspace.fullWorkerName,
      post: postName,
      department: departmentName,
      status: statusName,
      dateRange: new TuiDayRange(startDate, endDate),
    });
  }

  /**
   * Обработчик нажатия на карточку рабочего
   * @param workspace Выбранное рабочее место
   */
  async onWorkerClicked(workspace: ICurrentWorkspace) {
    if (!this.cdr) {
      console.error('ChangeDetectorRef is not defined');
      return;
    }

    await this.loadWorksapceInfo(workspace);
    await this.loadWorkspaceHistory(workspace.idWorkspace);
    this.cdr.markForCheck();
  }

  /**
   * Асинхронный метод для подгрузки данных о рабочем и обновлении их в форме
   * @param id Уникальный индетификатор выбранного рабочего
   */
  async loadWorker(id: number) {
    this.workerService.getWorker(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных рабочего: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.form.patchValue({
              post: data.postName,
              department: data.departmentName,
              status: data.statusName
            })
            this.cdr.markForCheck();
          }
        },
        error: err => console.error(err)
      });
  }

  /**
   * Метод, включающий и выключающий режим редактирования
   */
  toggleEditMode() {
    this.isEditMode = !this.isEditMode; // Переключаем флаг

    if (this.isEditMode) {
      // Включаем все поля формы
      this.form.get('worker')?.enable();
      this.form.get('status')?.enable();
      this.form.get('dateRange')?.enable();
    } else {
      // Отключаем поля формы
      this.form.get('worker')?.disable();
      this.form.get('status')?.disable();
      this.form.get('dateRange')?.disable();
    }
  }

  /**
   * Метод, пробразующий дату из типа данных string в тип данных TuiDay
   * @param dateString Дата в виде строки
   * @returns Дата с типом данных TuiDay
   */
  private parseDateString(dateString: string = ""): TuiDay {
    const date = new Date(dateString);
    return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Метод форматирующий дату в нужный вид
   * @param isoDateString Дата в виде iso
   * @returns Дата в виде строки
   */
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
}
{
  //#region Variables
  // form: FormGroup;
  // private readonly dialogs = inject(TuiDialogService);
  // protected isEditMode = false;
  // protected items = [10, 50, 100];
  // private destroyRef = inject(DestroyRef);
  // selectedWorkerId: number = 0;
  // selectedPostId: number = 0;
  // selectedDepartmentId: number = 0;
  // selectedStatusId: number = 0;
  //#region Use Interfaces
  // protected value: IRoomDto | null = null;
  // protected workspaces!: ICurrentWorkspace[];
  // protected workers!: IWorkerDetail[];
  // protected posts!: IPost[];
  // protected departments!: IDepartment[];
  // protected historyWorkspace!: IHistoryWorkspaceStatus[];
  // protected workersStatuseTypes!: IWorkersStatusesType[];
  //#endregion
  //#endregion

  //#region Constructor
  // constructor(
  //   private fb: FormBuilder,
  //   private workspaceService: WorkspaceService,
  //   private workerService: WorkerService,
  //   private postService: PostService,
  //   private departmentService: DepartmentService,
  //   private workersStatusesTypeService: WorkersStatusesTypeService,
  //   private cdr: ChangeDetectorRef
  // ) {
  //   this.form = this.fb.group({
  //     idWorkspace: [{ value: 0, disabled: false }],
  //     idStatusWorkspace: [{ value: 0, disabled: false }],
  //     worker: [{ value: '', disabled: true }, Validators.required], // Для работника
  //     position: [{ value: '', disabled: true }], // Для менеджера
  //     organization: [{ value: '', disabled: true }], // Для организации
  //     status: [{ value: '', disabled: true }, Validators.required], // Для статуса
  //     dateRange: [{
  //       value: null,
  //       disabled: true
  //     }, Validators.required]
  //   });

  //   this.loadWorkspaces(this.data.idRoom);
  //   this.loadWorkers();
  //   this.loadPost();
  //   this.loadDepartment();
  //   this.loadWorkersStatusesType();

  //   this.getForms();
  // }
  //#endregion

  //#region DialogData
  // public readonly context = injectContext<TuiDialogContext<IRoomDto, IRoomDto>>();

  // protected get data(): IRoomDto {
  //   return this.context.data;
  // }

  // protected submit(): void {
  //   if (this.value !== null) {
  //     this.context.completeWith(this.value);
  //   }
  // }

  // protected showDialog(content: TemplateRef<TuiDialogContext>): void {
  //   this.dialogs.open(content, { dismissible: true }).subscribe();
  // }
  //#endregion

  //#region load data from database
  // async loadWorkspaces(id: number) {
  //   this.workspaceService.getWorkspacesByRoom(id)
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных о рабочих местах: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.workspaces = data.map(workspace => ({ ...workspace }));;
  //           this.cdr.markForCheck();
  //         }
  //       }
  //     });
  // }

  // async loadWorkers() {
  //   this.workerService.getWorkers()
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных о рабочих: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.workers = data;
  //         }
  //       }
  //     });
  // }

  // async loadPost() {
  //   this.postService.getPosts()
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных о должностях: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.posts = data;
  //         }
  //       }
  //     });
  // }

  // async loadDepartment() {
  //   this.departmentService.getDepartments()
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных об отделах: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.departments = data;
  //         }
  //       }
  //     });
  // }

  // async loadWorkspace(id: number, workspace: ICurrentWorkspace) {
  //   this.workspaceService.getWorkspaceInfo(id)
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных о рабочем месте: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           const startDate = this.parseDateString(workspace.startDate);
  //           const endDate = workspace.endDate ? this.parseDateString(workspace.endDate) : startDate;
  //           this.form.patchValue({
  //             idWorkspace: id,
  //             idStatusWorkspace: workspace.idStatusWorkspace,
  //             idWorker: workspace.idWorker,
  //             worker: data.workerDetails?.fullWorkerName,
  //             position: data.workerDetails?.postName,
  //             organization: data.workerDetails?.departmentName,
  //             status: data.statusName,
  //             dateRange: new TuiDayRange(
  //               startDate,
  //               endDate
  //             )
  //           });
  //           this.cdr.markForCheck(); // Принудительное обновление
  //         }
  //       }
  //     });
  // }

  // async loadHistoryWorkspace(id: number) {
  //   this.workspaceService.getWorkspaceHistory(id)
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных об истории рабочего места: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.historyWorkspace = data;
  //         }
  //       }
  //     });
  // }

  // async loadData(id: number, workspace: ICurrentWorkspace) {
  //   await this.loadHistoryWorkspace(id);
  //   await this.loadWorkspace(id, workspace);
  // }

  // async loadWorkersStatusesType() {
  //   this.workersStatusesTypeService.getWorkersStatusesTypes()
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных о типах рабочих: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.workersStatuseTypes = data;
  //         }
  //       }
  //     });
  // }

  // async loadWorker(id: number) {
  //   this.workerService.getWorker(id)
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных об отделах: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           this.form.patchValue({
  //             position: data.postName,
  //             organization: data.departmentName,
  //             status: data.statusName
  //           })
  //         }
  //       }
  //     });
  // }
  //#endregion

  //#region Post data into database
  // postStatusWorkspace(workspace: IStatusWorkspaceDto) {
  //   this.workspaceService.addStatusWorkspace(workspace)
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       catchError(error => {
  //         console.error('Ошибка при обработке данных о рабочих местах: ', error);
  //         return of(null);
  //       })
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         if (data) {
  //           if (this.value) {
  //             this.loadWorkspaces(this.data.idRoom);
  //           }
  //           this.loadWorkers();
  //           this.loadPost();
  //           this.loadDepartment();
  //           this.cdr.markForCheck();
  //         }
  //       },
  //       error: (error) => console.error(error)
  //     });
  // }
  //#endregion

  //#region Methods
  // onWorkerClicked(workspace: ICurrentWorkspace) {
  //   this.loadData(workspace.idWorkspace, workspace);
  //   this.cdr.markForCheck(); // Принудительное обновление
  // }

  // getForms() {
  //   this.form.get('worker')?.valueChanges.subscribe({
  //     next: (selectedValue) => {
  //       const selectedWorker = this.workers.find(worker =>
  //         `${worker.fullWorkerName}` === selectedValue
  //       );
  //       if (selectedWorker) {
  //         this.selectedWorkerId = selectedWorker.idWorker
  //         this.loadWorker(this.selectedWorkerId);
  //       }
  //     }
  //   });

  //   this.form.get('position')?.valueChanges.subscribe({
  //     next: (selectedValue) => {
  //       const selectedPost = this.posts.find(post => post.name === selectedValue);
  //       if (selectedPost) {
  //         this.selectedPostId = selectedPost.idPost;
  //       }
  //     }
  //   });

  //   this.form.get('organization')?.valueChanges.subscribe({
  //     next: (selectedValue) => {
  //       const selectedDepartment = this.departments.find(department => department.name === selectedValue);
  //       if (selectedDepartment) {
  //         this.selectedDepartmentId = selectedDepartment.idDepartment;
  //       }
  //     }
  //   });

  //   this.form.get('status')?.valueChanges.subscribe({
  //     next: (selectedValue) => {
  //       const selectedStatus = this.workersStatuseTypes.find(wSt => wSt.name === selectedValue);
  //       if (selectedStatus) {
  //         this.selectedStatusId = selectedStatus.idStatus;
  //       }
  //     }
  //   })
  // }

  // saveClick() {
  //   if (this.form.invalid) {
  //     console.error('Ошибка валидации');
  //   }

  //   const formData = this.form.value;
  //   // console.log(formData);

  //   if (formData.dateRange && formData.dateRange.from && formData.dateRange.to) {
  //     const startDate = this.formatISODateToYMD(formData.dateRange.from.toLocalNativeDate().toISOString());
  //     let endDate: string | null = this.formatISODateToYMD(formData.dateRange.to.toLocalNativeDate().toISOString());

  //     if (startDate === endDate) {
  //       endDate = '';
  //     }

  //     const idStatusWorkspace = (formData.idStatusWorkspace === undefined || formData.idStatusWorkspace === null) ? 0 : formData.idStatusWorkspace;

  //     if (formData.idWorkspace !== undefined && this.selectedWorkerId !== undefined) {
  //       const workspaceData: IStatusWorkspaceDto = {
  //         idWorkspace: formData.idWorkspace,
  //         startDate: startDate,
  //         endDate: endDate,
  //         idStatusWorkspace: idStatusWorkspace,
  //         idWorker: this.selectedWorkerId,
  //         idWorkspaceStatusType: 1,
  //         idUser: 1,
  //         idWorkspacesReservationsStatuses: 1,
  //       };
  //       // console.log(workspaceData);

  //       this.postStatusWorkspace(workspaceData);
  //     } else {
  //       console.error('Некоторые обязательные поля формы не заполнены.');
  //     }
  //   } else {
  //     console.error('Диапазон дат не заполнен.');
  //   }
  // }

  // toggleEditMode() {
  //   this.isEditMode = !this.isEditMode; // Переключаем флаг

  //   if (this.isEditMode) {
  //     // Включаем все поля формы
  //     this.form.get('worker')?.enable();
  //     this.form.get('status')?.enable();
  //     this.form.get('dateRange')?.enable();
  //   } else {
  //     // Отключаем поля формы
  //     this.form.get('worker')?.disable();
  //     this.form.get('status')?.disable();
  //     this.form.get('dateRange')?.disable();
  //   }
  // }

  // clearClick(): void {
  //   let initialValue = this.fb.group({
  //     idWorkspace: this.form.value.idWorkspace,
  //     idStatusWorkspace: this.form.value.idStatusWorkspace,
  //     worker: [{ value: '', disabled: true }, Validators.required], // Для работника
  //     position: [{ value: '', disabled: true }], // Для менеджера
  //     organization: [{ value: '', disabled: true }], // Для организации
  //     status: [{ value: '', disabled: true }, Validators.required], // Для статуса
  //     dateRange: [{
  //       value: null,
  //       disabled: true
  //     }, Validators.required]
  //   }).value;
  //   this.form.reset(initialValue) // Сбрасываем форму до исходных значений
  //   this.form.disable();
  //   if (this.isEditMode) {
  //     this.form.get('idWorkspace')?.enable();
  //     this.form.get('idStatusWorkspace')?.enable();
  //     this.form.get('worker')?.enable();
  //     this.form.get('status')?.enable();
  //     this.form.get('dateRange')?.enable();
  //   }
  // }

  // private parseDateString(dateString: string = ""): TuiDay {
  //   const date = new Date(dateString);
  //   return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
  // }

  // private formatISODateToYMD(isoDateString: string): string {
  //   // Создаем объект даты из строки в формате ISO
  //   const date = new Date(isoDateString);

  //   // Проверяем, что дата корректна
  //   if (isNaN(date.getTime())) {
  //     throw new Error("Invalid date string");
  //   }

  //   const year = date.getUTCFullYear();
  //   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  //   const day = String(date.getUTCDate()).padStart(2, '0');

  //   return `${year}-${month}-${day}`;
  // }
  //#endregion
}
