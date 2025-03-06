//#region IMPORTS
import { ChangeDetectorRef } from '@angular/core';
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
import { WorkspaceService } from '@controllers/workspace.service';
import { WorkerService } from '@controllers/worker.service';
import { PostService } from '@controllers/post.service';
import { DepartmentService } from '@controllers/department.service';
import { WorkersStatusesTypeService } from '@controllers/workersStatusesType.service';
import { IOffice } from '@models/Office';
import { ReportService } from '@controllers/report.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import saveAs from 'file-saver';
import { UserService } from '@controllers/user.service';
import { Router } from '@angular/router';
//#endregion

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
  ],
  templateUrl: './report-window.component.html',
  styleUrls: ['./report-window.component.scss'],
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '.' })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportWindowComponent {
  //#region  Variables
  private destroyRef = inject(DestroyRef);
  protected value!: IOffice;
  protected form: FormGroup;
  protected isAdmin: boolean = false;
  protected reportTypes = ['Финансовый по офису', 'Отчёт по Работникам'];
  //#endregion

  /**
   * Конструктор компонента.
   *
   * @param fb - Сервис для создания форм.
   * @param reportService - Сервис для работы с отчетами.
   * @param authService - Сервис для работы с аутентификацией пользователя.
   * @param router - Сервис для маршрутизации.
   */
  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private authService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      reportType: null,
      idOffice: this.data.idOffice,
      idUser: 1,
    });
    this.isAdmin = this.authService.isAdmin();
    if (!this.isAdmin) {
      this.context.completeWith(this.data);
      return;
    }
  }

  /**
   * Контекст диалогового окна, содержащий данные, переданные в модальное окно.
   */
  public readonly context = injectContext<TuiDialogContext<IOffice, IOffice>>();

  /**
   * Данные, передаваемые со страницы в модальное окно.
   *
   * @returns Данные офиса.
   */
  protected get data(): IOffice {
    return this.context.data;
  }

  /**
   * Метод для отправки запроса на создание отчета.
   *
   * @param reportTypeId - Идентификатор типа отчета.
   * @param officeId - Идентификатор офиса.
   * @param idUser - Идентификатор пользователя.
   */
  postReport(reportTypeId: number, officeId: number, idUser: number) {
    this.reportService
      .getRentalCost(reportTypeId, officeId, idUser)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при создания отчета: ', error);
          return of(null);
        })
      )
      .subscribe({
        next: (blob: any) => {
          saveAs(blob, 'report.xlsx');
          this.context.completeWith(this.data);
        },
        error: error => console.error(error),
      });
  }

  /**
   * Метод для обработки отправки формы.
   */
  onSubmit() {
    const formData = this.form.value;
    formData.reportType = formData.reportType === 'Финансовый по офису' ? 1 : 2;
    console.log(formData.reportType);

    this.postReport(formData.reportType, formData.idOffice, formData.idUser);
  }
}
