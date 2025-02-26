//#region IMPORTS 
import { ChangeDetectorRef, Component, DestroyRef, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SafeHtmlPipe } from '@services/safe-html.pipe';
import { NgFor } from '@angular/common';
import { IFloorDto, IRoomDto } from '@DTO';
import { RoomService } from '@controllers/room.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { tuiDialog } from '@taiga-ui/core/components/dialog';
import { ModalComponent } from '@components/modalWindow/modalWindow.component';
//#endregion

@Component({
  selector: 'app-floor-schema',
  imports: [SafeHtmlPipe, NgFor],
  templateUrl: './floor-schema.component.html',
  styleUrls: ['./floor-schema.component.css']
})
export class FloorSchemaComponent implements OnInit, OnChanges {
  //#region Variables
  @Input() floorInfo!: IFloorDto;
  roomData!: IRoomDto;
  rooms: string[] = [];
  widthSvg: string | null = null;
  heightSvg: string | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  private destroyRef = inject(DestroyRef);
  //#endregion

  constructor(
    private cdr: ChangeDetectorRef,
    private roomService: RoomService
  ) { }

  ngOnInit(): void {
    this.processFloorInfo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['floorInfo']) {
      const newFloorInfo = changes['floorInfo'].currentValue;
      const oldFloorInfo = changes['floorInfo'].previousValue;

      if (newFloorInfo && newFloorInfo.schemeContent !== (oldFloorInfo?.schemeContent)) {
        this.processFloorInfo();
      }
    }
  }

  //#region Methods
  private readonly dialog = tuiDialog(ModalComponent, {
    dismissible: true,
    size: 'auto'
  });

  private processFloorInfo(): void {
    if (this.floorInfo && this.floorInfo.schemeContent) {
      this.processSvg(this.floorInfo.schemeContent);
      this.cdr.detectChanges(); // Вручную запускаем обновление
    } else {
      console.warn("floorInfo или schemeContent не определены");
    }
  }

  private processSvg(svgText: string): void {
    this.rooms = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    const svgElement = doc.querySelector('svg');

    if (svgElement) {
      this.widthSvg = svgElement.getAttribute('width');
      this.heightSvg = svgElement.getAttribute('height');
    } else {
      console.warn('SVG element not found in the provided text.');
      return;
    }

    const linkElements = Array.from(doc.querySelectorAll('a'));
    linkElements.forEach(link => {
      const linkContent = link.innerHTML;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = linkContent;
      link.replaceWith(...Array.from(tempDiv.childNodes));
      this.rooms.push(linkContent);
    });
  }

  async onRoomClick(room: IRoomDto) {
    try {
      await this.loadRoom(room.idRoom);
      this.dialog(this.roomData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data) => {
          console.info(`Dialog emitted data = ${data}`);
        },
        complete: () => {
          console.info('Dialog closed');
        },
      });
    } catch (error) {
      console.error('Ошибка при загрузке данных комнаты: ', error);
      this.showErrorModal('Ошибка', 'Не удалось загрузить данные комнаты.');
    }
  }

  loadRoom(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomService.getRoom(id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Ошибка при обработке данных о комнате: ', error);
            this.showErrorModal('Ошибка', 'Не удалось загрузить данные о комнате.');
            return of(null);
          })
        )
        .subscribe({
          next: (data) => {
            if (data) {
              this.roomData = data;
              resolve();
            } else {
              this.showErrorModal('Ошибка', 'Данные комнаты не найдены.');
              reject('Данные комнаты не найдены');
            }
          },
          error: (err) => {
            this.showErrorModal('Ошибка', 'Произошла ошибка при загрузке данных.');
            reject(err);
          }
        });
    });
  }

  private showErrorModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
  //#endregion
}