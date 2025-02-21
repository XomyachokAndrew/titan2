//#region IMPORTS
import {
  Component,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FloorService } from '../../../services/controllers/floor.service';
import { OfficeService } from '../../../services/controllers/office.service';
import { IFloorDto, IOfficeDto } from '../../../services/models/DTO';
import LoadingComponent from '../../../components/loading/loading.component';
import { TuiPagination } from '@taiga-ui/kit';
import { FloorSchemaComponent } from '../../../components/floor-schema/floor-schema.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TuiButton } from '@taiga-ui/core';
//#endregion

@Component({
  selector: 'office',
  templateUrl: './office.component.html',
  imports: [
    LoadingComponent,
    TuiPagination,
    FloorSchemaComponent,
    TuiButton,
  ],
  styleUrls: ['./office.scss'],
})
export class OfficeComponent implements OnInit {
  //#region Variables
  isLoading: boolean = true;
  id!: number;
  private subscription: Subscription;
  private destroyRef = inject(DestroyRef);
  //#region Pagination
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalFloors: number = 0;
  //#endregion
  //#region Interfaces
  dataOffice!: IOfficeDto;
  dataFloors: IFloorDto[] = [];
  currentFloor: IFloorDto | null = null;
  //#endregion
  //#endregion

  //#region Constructor and ngOnInit
  constructor(
    private activateRoute: ActivatedRoute,
    private floorService: FloorService,
    private officeService: OfficeService
  ) {
    this.subscription = activateRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.id = params["id"]);
  }

  ngOnInit() {
    this.loadOffice();
    this.loadFloors();
  }
  //#endregion

  //#region load data from database 
  loadOffice() {
    this.officeService.getOfficesById(this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных офиса: ', error);
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.dataOffice = data;
          }
          this.isLoading = false;
        }
      });
  }

  loadFloors() {
    this.floorService.getFloorsByOfficeId(this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных этажей: ', error);
          return of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.dataFloors = data;
          this.totalFloors = this.dataFloors.length;
          this.currentPage = 0;
          if (this.dataFloors.length > 0) {
            this.loadFloor(this.dataFloors[this.currentPage].idFloor); // Загружаем первый этаж
          }
        }
      });
  }

  loadFloor(id: number) {
    this.floorService.getFloorById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error("Ошибка при обработке данных этажа: ", error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.currentFloor = data;
          }
        }
      });
  }
  //#endregion

  //#region Pgination methods
  get paginatedFloor(): IFloorDto | null {
    return this.currentFloor;
  }

  onPageChange(pageIndex: number) {
    this.currentPage = pageIndex;
    if (this.dataFloors.length > 0) {
      this.loadFloor(this.dataFloors[this.currentPage].idFloor); // Загружаем этаж при изменении страницы
    }
  }
  //#endregion
}
