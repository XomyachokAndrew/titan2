import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { IDepartment } from '@models/Department';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { DepartmentService } from '@controllers/department.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PostService } from '@controllers/post.service';
import { IPost } from '@models/Post';
import { WorkerService } from '@controllers/worker.service';
import { IStatusWorkerDto, IWorkerDto } from '@models/DTO';
import { IWorker } from '@models/Worker';

@Component({
  selector: 'createWorker',
  templateUrl: './createWorker.component.html',
  styleUrls: ['./createWorker.scss'],
  imports: [
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextfield,
    TuiDataListWrapper,
    TuiTextfieldControllerModule,
    TuiSelectModule,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
})
export class CreateWorkerComponent {
  employeeForm: FormGroup;
  protected departments!: IDepartment[];
  protected posts!: IPost[];
  protected selectedPostId: number = 0;
  protected selectedDepartmentId: number = 0;
  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private postService: PostService,
    private workerService: WorkerService,
    private cdr: ChangeDetectorRef,
  ) {
    this.employeeForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      middleName: [null],
      post: [null, Validators.required],
      department: [null, Validators.required],
    });

    this.loadDepartments();
    this.loadPosts();

    this.employeeForm.get('post')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedPost = this.posts.find(post => post.name === selectedValue);
        if (selectedPost) {
          this.selectedPostId = selectedPost.idPost;
          console.log(selectedPost);
        }
      }
    });

    this.employeeForm.get('department')?.valueChanges.subscribe({
      next: (selectedValue) => {
        const selectedDepartment = this.departments.find(department => department.name === selectedValue);
        if (selectedDepartment) {
          this.selectedDepartmentId = selectedDepartment.idDepartment;
          console.log(selectedDepartment);
        }
      }
    });
  }

  async loadDepartments() {
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

  async loadPosts() {
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

  async onSubmit() {
    if (!this.employeeForm.valid) {
      return;
    }

    const formData = this.employeeForm.value;

    const worker: IWorkerDto = {
      name: formData.firstName,
      surname: formData.lastName,
      patronymic: formData.middleName
    };

    this.postWorker(worker);
  }

  postWorker(worker: IWorkerDto) {
    this.workerService.addWorker(worker)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при добавлении статуса: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: async () => {
          console.log('Good worker');
          await this.loadWorkerId();
          this.cdr.markForCheck();
        },
        error: (error) => console.error(error)
      });
  }

  updatedWorker(lastWorker: IWorker) {
    const statusWorker: IStatusWorkerDto = {
      idStatusWorker: 0,
      idWorker: lastWorker.idWorker,
      idPost: this.selectedPostId,
      idDepartment: this.selectedDepartmentId,
      idUser: 1,
      idStatus: 1,
    };

    this.postStatusWorker(statusWorker);
  }

  postStatusWorker(statusWorker: IStatusWorkerDto) {
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
          console.log('Very good worker');

        },
        error: (error) => console.error(error)
      });
  }

  async loadWorkerId() {
    this.workerService.getLastWorker()
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
            this.updatedWorker(data);
          }
        },
        error: err => console.error(err)
      });
  }
}
