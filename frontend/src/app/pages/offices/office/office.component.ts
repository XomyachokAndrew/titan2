import { Component, OnInit, AfterViewInit, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { FloorService } from '../../../services/controllers/floor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OfficeService } from '../../../services/controllers/office.service';
import { IFloor } from '../../../services/models/Floor';
import { IOfficeDto } from '../../../services/models/DTO';
import LoadingComponent from '../../../components/loading/loading.component';
import { TuiPagination } from '@taiga-ui/kit';
import { FloorSchemaComponent } from "../../../components/floor-schema/floor-schema.component";

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

  dataFloors: IFloor[] = [];
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
    this.officeService.getOfficesById(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        response => {
          this.dataOffice = response;
          this.isLoading = false;
        }
      );
    this.loadFloors();
  }

  loadFloors() {
    this.floorService.getFloorsByOfficeId(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dataFloors = data;
          this.totalFloors = this.dataFloors.length;
          this.currentPage = 0; // Reset to the first page after loading
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  get paginatedFloor(): IFloor {
    return this.dataFloors[this.currentPage];
  }

  onPageChange(pageIndex: number) {
    this.currentPage = pageIndex;
  }

  ngAfterViewInit(): void {
    // Implement any logic needed after view initialization
  }
}
