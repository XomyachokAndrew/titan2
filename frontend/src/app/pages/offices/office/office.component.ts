//#region IMPORTS
import {
  Component,
  OnInit,
  DestroyRef,
  inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
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
import { Location } from '@angular/common'; // <-- Добавлено
import { UserService } from '../../../services/controllers/user.service';
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
  isAuth: boolean = false;
  id!: number;
  private destroyRef = inject(DestroyRef);
  //#region Pagination
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalFloors: number = 0;
  //#endregion
  //#region Interfaces
  dataOffice!: IOfficeDto;
  dataFloors!: IFloorDto[];
  currentFloor: IFloorDto | null = null;
  //#endregion
  //#endregion

  //#region Constructor and ngOnInit
  constructor(
    private activateRoute: ActivatedRoute,
    private floorService: FloorService,
    private officeService: OfficeService,
    private location: Location,
    private authService: UserService
  ) { }

  ngOnInit() {
    this.isAuth = this.authService.isAuthenticated()
    if (!this.isAuth) {
      this.location.back();
    }
    this.id = this.activateRoute.snapshot.params['id'];
    this.loadData();
  }
  //#endregion

  //#region load data from database 
  loadData() {
    forkJoin({
      office: this.officeService.getOfficesById(this.id).pipe(
        catchError((error) => {
          console.error('Ошибка при обработке данных офиса: ', error);
          this.isLoading = false;
          return of(null);
        })
      ),
      floors: this.floorService.getFloorsByOfficeId(this.id).pipe(
        catchError(error => {
          console.error('Ошибка при обработке данных этажей: ', error);
          return of([]);
        })
      ),
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ office, floors }) => {
          if (office) {
            this.dataOffice = office;
          }
          this.dataFloors = floors;
          this.totalFloors = floors.length
          if (this.totalFloors > 0) {
            this.loadFloor(floors[this.currentPage].idFloor);
          }
          this.isLoading = false;
        }
      })
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
