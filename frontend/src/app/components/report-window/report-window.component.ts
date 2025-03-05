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
  protected reportTypes = ["Финансовый по офису", "Отчёт по Работникам"];
  //#endregion
  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    this.form = this.fb.group({
      reportType: null,
      idOffice: this.data.idOffice,
      idUser: 1
    });
  }

  public readonly context =
    injectContext<TuiDialogContext<IOffice, IOffice>>();

  /**
   * Данные передаваемые со страницы в модальное окно
   */
  protected get data(): IOffice {
    return this.context.data;
  }

  postReport(reportTypeId: number, officeId: number, idUser: number) {
    this.reportService.getRentalCost(reportTypeId, officeId, idUser)
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
        },
        error: error => console.error(error),
      });
  }

  onSubmit() {
    const formData = this.form.value;
    formData.reportType = formData.reportType === "Финансовый по офису" ? 1 : 2;
    console.log(formData.reportType);
    
    
    this.postReport(formData.reportType, formData.idOffice, formData.idUser);
  }
}
