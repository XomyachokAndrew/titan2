import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiInputModule,
  TuiSelectComponent,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { IDepartment } from '@models/Department';
import { TuiTextfield, TuiAlertService } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { DepartmentService } from '@controllers/department.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PostService } from '@controllers/post.service';
import { IPost } from '@models/Post';
import { WorkerService } from '@controllers/worker.service';
import { IStatusWorkerDto, IWorkerDto } from '@models/DTO';
import { IWorker } from '@models/Worker';
import { UserService } from '@controllers/user.service';
import { Router } from '@angular/router';

/**
 * Компонент для создания нового работника.
 * Позволяет вводить данные о работнике, выбирать отдел и должность, а также сохранять информацию.
 */
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
  protected employeeForm: FormGroup;
  protected departments!: IDepartment[];
  protected posts!: IPost[];
  protected selectedPostId: number = 0;
  protected selectedDepartmentId: number = 0;
  private destroyRef = inject(DestroyRef);
  private alerts = inject(TuiAlertService);
  protected isAdmin: boolean = false;

  /**
   * Конструктор компонента.
   *
   * @param fb - Сервис для создания форм.
   * @param departmentService - Сервис для работы с отделами.
   * @param postService - Сервис для работы с должностями.
   * @param workerService - Сервис для работы с работниками.
   * @param cdr - Сервис для управления изменениями.
   * @param authService - Сервис для работы с аутентификацией пользователя.
   * @param router - Сервис для маршрутизации.
   */
  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private postService: PostService,
    private workerService: WorkerService,
    private cdr: ChangeDetectorRef,
    private authService: UserService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      middleName: [null],
      post: [null],
      department: [null],
    });

    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      this.router.navigate(['']);
      return;
    }

    this.loadDepartments();
    this.loadPosts();

    this.employeeForm.get('post')?.valueChanges.subscribe({
      next: selectedValue => {
        const selectedPost = this.posts.find(
          post => post.name === selectedValue
        );
        if (selectedPost) {
          this.selectedPostId = selectedPost.idPost;
          console.log(selectedPost);
        }
      },
    });

    this.employeeForm.get('department')?.valueChanges.subscribe({
      next: selectedValue => {
        const selectedDepartment = this.departments.find(
          department => department.name === selectedValue
        );
        if (selectedDepartment) {
          this.selectedDepartmentId = selectedDepartment.idDepartment;
          console.log(selectedDepartment);
        }
      },
    });
  }

  /**
   * Метод для загрузки данных об отделах.
   */
  async loadDepartments() {
    this.departmentService
      .getDepartments()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных об отделах: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.departments = data;
          }
        },
      });
  }

  /**
   * Метод для загрузки данных о должностях.
   */
  async loadPosts() {
    this.postService
      .getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных о должностях: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: data => {
          if (data) {
            this.posts = data;
          }
        },
      });
  }

  /**
   * Метод для обработки отправки формы.
   */
  async onSubmit() {
    if (!this.employeeForm.valid) {
      this.alerts
        .open(`Поля введены неправильно`, {
          label: 'Добавление работника',
          appearance: 'negative',
        })
        .subscribe();
      return;
    }

    const formData = this.employeeForm.value;

    const worker: IWorkerDto = {
      name: formData.firstName,
      surname: formData.lastName,
      patronymic: formData.middleName,
    };

    this.postWorker(worker);

    this.clearClick();
  }

  /**
   * Метод для добавления нового работника.
   *
   * @param worker - Данные о работнике.
   */
  postWorker(worker: IWorkerDto) {
    this.workerService
      .addWorker(worker)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при добавлении статуса: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: async data => {
          this.addWorkerAlert(worker);
          this.updatedWorker(data.idWorker);
          this.cdr.markForCheck();
        },
        error: error => console.error(error),
      });
  }

  /**
   * Метод для обновления данных о работнике после его добавления.
   *
   * @param idWorker - Идентификатор работника.
   */
  updatedWorker(idWorker: number) {
    const statusWorker: IStatusWorkerDto = {
      idStatusWorker: 0,
      idWorker: idWorker,
      idPost: this.selectedPostId,
      idDepartment: this.selectedDepartmentId,
      idUser: 1,
      idStatus: 1,
    };

    this.postStatusWorker(statusWorker);
  }

  /**
   * Метод для добавления статуса работника.
   *
   * @param statusWorker - Данные о статусе работника.
   */
  postStatusWorker(statusWorker: IStatusWorkerDto) {
    this.workerService
      .addStatusWorker(statusWorker)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при добавлении статуса: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: () => {},
        error: error => console.error(error),
      });
  }

  /**
   * Метод для очистки полей формы.
   */
  clearClick() {
    this.alerts
      .open(`Поля отчистились`, {
        label: 'Добавление работника',
        appearance: 'positive',
      })
      .subscribe();
    this.employeeForm.reset();
  }

  /**
   * Метод для отображения уведомления о успешном добавлении работника.
   *
   * @param worker - Данные о работнике.
   */
  addWorkerAlert(worker: IWorkerDto) {
    this.alerts
      .open(
        `Работник ${worker.surname} ${worker.name} ${worker.patronymic} успешно добавлен`,
        {
          label: 'Добавление работника',
          appearance: 'positive',
        }
      )
      .subscribe();
  }
}
