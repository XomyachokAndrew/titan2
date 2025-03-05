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
import { TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSlider } from '@taiga-ui/kit';
import { tuiDateFormatProvider } from '@taiga-ui/core';
import { TuiInputDateRangeModule } from '@taiga-ui/legacy';
import {
  TuiInputModule,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ICurrentWorkspace } from '../../services/models/CurrentWorkspace';
import { IWorkerDetail } from '@models/WorkerDetail';
import { PostService } from '@controllers/post.service';
import { DepartmentService } from '@controllers/department.service';
import { WorkersStatusesTypeService } from '@controllers/workersStatusesType.service';
import { IDepartment } from '@models/Department';
import { IPost } from '@models/Post';
import { IWorkersStatusesType } from '@models/WorkersStatusesType';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { WorkerService } from '@controllers/worker.service';
import { IStatusWorkerDto, IWorkerDto } from '@models/DTO';
import { UserService } from '@controllers/user.service';

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
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
  templateUrl: './workerModalWindow.component.html',
  styleUrls: ['./workerModalWindow.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })],
})
export class ModalWorkerComponent {
  form: FormGroup; // Объявляем FormGroup
  protected value: IWorkerDetail | null = null;
  protected workspaces!: ICurrentWorkspace[];
  protected departments!: IDepartment[];
  protected posts!: IPost[];
  protected workerStatusTypes!: IWorkersStatusesType[];
  protected selectedPostId: number = 0;
  protected selectedDepartmentId: number = 0;
  protected selectedWorkerStatusTypeId: number = 0;
  private initialForm!: any;
  private destroyRef = inject(DestroyRef);
  protected isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private departmentService: DepartmentService,
    private workerStatusTypeService: WorkersStatusesTypeService,
    private workerService: WorkerService,
    private authService: UserService,
  ) {
    this.form = this.fb.group({
      statusWorkerId: this.data.idStatusWorker,
      workerId: this.data.idWorker, // Работник
      worker: this.data.fullWorkerName,
      postId: this.data.idPost, // Должнось
      post: this.data.postName,
      departmentId: this.data.idDepartment, // Отдел
      department: this.data.departmentName,
      statusId: this.data.idStatus, // Статус
      status: this.data.statusName,
    });

    if (!this.isAdmin) {
      this.context.completeWith(this.data);
      return;
    }

    this.initialForm = this.form.value;

    this.loadDepartments();
    this.loadPosts();
    this.loadWorkerStatusTypes();

    this.form.get('status')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedWorkerStatusType = this.workerStatusTypes.find(wst =>
          wst.name === selectedValue
        );
        if (selectedWorkerStatusType) {
          this.selectedWorkerStatusTypeId = selectedWorkerStatusType.idStatus
        }
      }
    });

    this.form.get('post')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedPost = this.posts.find(post => post.name === selectedValue);
        if (selectedPost) {
          this.selectedPostId = selectedPost.idPost;
        }
      }
    });

    this.form.get('department')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedDepartment = this.departments.find(department => department.name === selectedValue);
        if (selectedDepartment) {
          this.selectedDepartmentId = selectedDepartment.idDepartment;
        }
      }
    });
  }

  public readonly context = injectContext<TuiDialogContext<IWorkerDetail, IWorkerDetail>>();

  protected get data() {
    return this.context.data;
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

  onSubmit() {
    const formData = this.form.value;

    if (this.data.fullWorkerName !== formData.worker) {
      const [lastName, firstName, middleName] = formData.worker.split(' ');
      const workerDto: IWorkerDto = {
        name: firstName,
        surname: lastName,
        patronymic: middleName
      }
      this.updatedWorkerName(formData.workerId, workerDto)
    }

    if (
      formData.post == this.initialForm.post
      && formData.department == this.initialForm.department
      && formData.status == this.initialForm.status
    ) { }
    else {
      const statusWorker: IStatusWorkerDto = {
        idStatusWorker: formData.statusWorkerId,
        idWorker: formData.workerId,
        idPost: this.selectedPostId ? this.selectedPostId : formData.postId,
        idDepartment: this.selectedDepartmentId ? this.selectedDepartmentId : formData.departmentId,
        idUser: 1,
        idStatus: this.selectedWorkerStatusTypeId ? this.selectedWorkerStatusTypeId : formData.statusId,
      }

      this.updatedWorker(statusWorker);
    }
  }

  updatedWorker(statusWorker: IStatusWorkerDto) {
    this.workerService.addStatusWorker(statusWorker)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при добавлении статуса: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.context.completeWith(this.data);
        },
        error: (error) => console.error(error)
      });
  }

  updatedWorkerName(id: number, workerDto: IWorkerDto) {
    this.workerService.updateWorker(id, workerDto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обновлении имени: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.context.completeWith(this.data);
        },
        error: (error) => console.error(error)
      });
  }

  deleteClick() {
    console.log(this.form.get('workerId')?.value);

    this.deleteWorker(this.form.get('workerId')?.value)
  }

  deleteWorker(id: number) {
    this.workerService.deleteWorker(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при удалении статуса: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.context.completeWith(this.data);
        },
        error: (error) => console.error(error)
      });
  }
}
