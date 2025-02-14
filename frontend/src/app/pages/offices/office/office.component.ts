import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, DestroyRef, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { FloorService } from '../../../services/controllers/floor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OfficeService } from '../../../services/controllers/office.service';
import { IFloor } from '../../../services/models/Floor';
import { IOfficeDto } from '../../../services/models/DTO';
import LoadingComponent from '../../../components/loading/loading.component';
import { NgFor } from '@angular/common';
import { TuiPagination } from '@taiga-ui/kit';
import { SafeHtmlPipe } from '../../../services/safe-html.pipe';

@Component({
  selector: 'office',
  templateUrl: './office.component.html',
  imports: [LoadingComponent, TuiPagination, SafeHtmlPipe],
  styleUrls: ['./office.scss'],
})
export class OfficeComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;
  svgContent: SafeHtml = '';
  svgData: any = '';

  id: number = 1;
  private subscription: Subscription;
  private destroyRef = inject(DestroyRef);

  dataFloors: IFloor[] = [];
  dataOffice!: IOfficeDto;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalFloors: number = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private el: ElementRef,
    private renderer: Renderer2,
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
      .subscribe(
        response => {
          this.dataFloors = response;
          this.totalFloors = this.dataFloors.length;
        },
        error => {
          console.error(error);
        }
      );
  }

  floor!: IFloor;

  get paginatedFloor(): IFloor {
    this.dataFloors.slice(this.currentPage, this.currentPage + 1).map(f => {
      this.floor = f;
    });
    
    return this.floor;
  }

  onRoomClick(event: MouseEvent, roomId: string): void {
    event.preventDefault();
    console.log(`Clicked on room with ID: ${roomId}`);
    // Добавьте здесь логику для обработки клика на комнату
  }
  
  async onPageChange(pageIndex: number) {
    await this.addEventListeners();
    this.currentPage = pageIndex;
  }

  ngAfterViewInit(): void {
  }

  async addEventListeners() {
    console.log(this.el.nativeElement);
    if (this.paginatedFloor) {
    
      const links = this.el.nativeElement.querySelectorAll('a');
      console.log(links);
      
      links.forEach((link: { addEventListener: (arg0: string, arg1: (event: any) => void) => void; getAttribute: (arg0: string) => any; }) => {
        link.addEventListener('click', (event: MouseEvent) => {
          event.preventDefault();
          const roomId = link.getAttribute('data-room-id');
          this.onRoomClick(event, roomId);
        });
      });
    }
  }
}