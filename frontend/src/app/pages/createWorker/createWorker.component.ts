import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { IDepartment } from '../../services/models/Department';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { DepartmentService } from '../../services/controllers/department.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PostService } from '../../services/controllers/post.service';
import { IPost } from '../../services/models/Post';

interface Employee {
  firstName: string;
  lastName: string;
  middleName: string;
  position: string;
  organization: string;
}

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
  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private postService: PostService,
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      position: ['', Validators.required],
      organization: ['', Validators.required],
    });

    this.loadDepartment();
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

  onSubmit() {
    if (this.employeeForm.valid) {
      const employee: Employee = this.employeeForm.value;
      console.log('Employee Data:', employee);
      // Здесь вы можете отправить данные на сервер или выполнить другие действия
    }
  }
}
