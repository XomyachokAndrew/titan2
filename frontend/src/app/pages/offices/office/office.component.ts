import { Component, OnInit, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { FloorService } from '../../../services/controllers/floor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OfficeService } from '../../../services/controllers/office.service';
import { IFloorDto, IOfficeDto } from '../../../services/models/DTO';
import LoadingComponent from '../../../components/loading/loading.component';
import { TuiPagination } from '@taiga-ui/kit';
import { FloorSchemaComponent } from "../../../components/floor-schema/floor-schema.component";
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'office',
  templateUrl: './office.component.html',
  imports: [LoadingComponent, TuiPagination, FloorSchemaComponent],
  styleUrls: ['./office.scss'],
})
export class OfficeComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;

  id: number = 1;
  private subscription: Subscription;
  private destroyRef = inject(DestroyRef);

  dataFloors: IFloorDto[] = [];
  floors!: IFloorDto;
  dataOffice!: IOfficeDto;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalFloors: number = 0;

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

  loadOffice = () => {
    this.officeService.getOfficesById(this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Ошибка при обработке данных офиса: ', error);
          this.isLoading = false;
          return of(null); // Возвращаем пустой поток
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

  loadFloors = () => {
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
        }
      });
  }

  loadFloor = (id: number) => {
    this.floorService.getFloorById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error("Ошибка при обработке данных этажa: ", error);
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.floors = data;
          }
        }
      })
  }

  get paginatedFloor(): IFloorDto {
    this.loadFloor(this.dataFloors[this.currentPage].idFloor);
    return this.floors;
  }

  onPageChange(pageIndex: number) {
    this.currentPage = pageIndex;
  }

  ngAfterViewInit(): void { }
}