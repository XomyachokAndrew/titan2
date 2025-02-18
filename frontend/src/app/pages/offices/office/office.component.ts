import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  Renderer2,
  DestroyRef,
  inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { tuiDialog } from '@taiga-ui/core/components/dialog';
import { ModalComponent } from '../../../components/modalWindow/modalWindow.component';
import { FloorService } from '../../../services/controllers/floor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OfficeService } from '../../../services/controllers/office.service';
import { IFloorDto, IOfficeDto } from '../../../services/models/DTO';
import LoadingComponent from '../../../components/loading/loading.component';
import { TuiPagination } from '@taiga-ui/kit';
import { FloorSchemaComponent } from '../../../components/floor-schema/floor-schema.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TuiButton } from '@taiga-ui/core';

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
export class OfficeComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;

  id: number = 1;
  private subscription: Subscription;
  private destroyRef = inject(DestroyRef);

  dataFloors: IFloorDto[] = [];
  dataOffice!: IOfficeDto;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalFloors: number = 0;
  currentFloor: IFloorDto | null = null;

  showModal = false;
  modalTitle = '';
  modalMessage = '';

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

  private readonly dialog = tuiDialog(ModalComponent, {
    dismissible: true,
    label: 'Информация о кабинете',
    size: 'auto'
  });

  onSvgElementClick(element: HTMLElement, index: number): void {
    this.dialog(237).subscribe({
      next: (data) => {
        console.info(`Dialog emitted data = ${data}`);
      },
      complete: () => {
        console.info('Dialog closed');
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

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

  get paginatedFloor(): IFloorDto | null {
    return this.currentFloor;
  }

  onPageChange(pageIndex: number) {
    this.currentPage = pageIndex;
    if (this.dataFloors.length > 0) {
      this.loadFloor(this.dataFloors[this.currentPage].idFloor); // Загружаем этаж при изменении страницы
    }
  }

  ngAfterViewInit(): void { }
}
