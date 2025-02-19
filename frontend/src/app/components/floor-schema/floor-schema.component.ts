import { ChangeDetectorRef, Component, DestroyRef, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SafeHtmlPipe } from '../../services/safe-html.pipe';
import { NgFor } from '@angular/common';
import { IFloorDto } from '../../services/models/DTO';
import { IRoom } from '../../services/models/Room';
import { RoomService } from '../../services/controllers/room.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { tuiDialog } from '@taiga-ui/core/components/dialog';
import { ModalComponent } from '../../components/modalWindow/modalWindow.component';

@Component({
  selector: 'app-floor-schema',
  imports: [SafeHtmlPipe, NgFor],
  templateUrl: './floor-schema.component.html',
  styleUrls: ['./floor-schema.component.css']
})
export class FloorSchemaComponent implements OnInit, OnChanges {
  @Input() floorInfo!: IFloorDto;
  rooms: string[] = [];
  roomData!: IRoom;
  widthSvg: any = 0;
  heightSvg: any = 0;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  private destroyRef = inject(DestroyRef);

  constructor(
    private cdr: ChangeDetectorRef,
    private roomService: RoomService
  ) { }

  ngOnInit(): void {
    if (this.floorInfo && this.floorInfo.schemeContent) {
      this.processSvg(this.floorInfo.schemeContent);
    } else {
      console.warn("floorInfo или schemeContent не определены в ngOnInit");
    }
  }

  private readonly dialog = tuiDialog(ModalComponent, {
    dismissible: true,
    label: 'Информация о кабинете',
    size: 'auto'
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['floorInfo']) {
      const newFloorInfo = changes['floorInfo'].currentValue;
      if (newFloorInfo && newFloorInfo.schemeContent) {
        this.processSvg(newFloorInfo.schemeContent);
        this.cdr.detectChanges(); // Вручную запускаем обновление
      } else {
        console.warn("Новое значение floorInfo или schemeContent не определены в ngOnChanges");
      }
    }
  }

  processSvg(svgText: string): void {
    this.rooms = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    const svgElement = doc.querySelector('svg');

    if (svgElement) {
      this.widthSvg = svgElement.getAttribute('width');
      this.heightSvg = svgElement.getAttribute('height');
    } else {
      console.warn('SVG element not found in the provided text.');
    }

    const linkElements = doc.querySelectorAll('a');
    linkElements.forEach(link => {
      const linkContent = link.innerHTML;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = linkContent;
      link.replaceWith(...Array.from(tempDiv.childNodes));
      this.rooms.push(linkContent);
    });
  }

  async onRoomClick(room: IRoom) {
    await this.loadRoom(room.idRoom);
    this.dialog(this.roomData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        console.info(`Dialog emitted data = ${data}`);
      },
      complete: () => {
        console.info('Dialog closed');
      },
    });
  }

  loadRoom(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomService.getRoom(id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error('Ошибка при обработке данных о комнате: ', error);
            return of(null);
          })
        )
        .subscribe({
          next: (data) => {
            if (data) {
              this.roomData = data;
              resolve();
            } else {
              reject('Данные комнаты не найдены');
            }
          },
          error: (err) => reject(err)
        });
    });
  }

  closeModal(): void {
    this.showModal = false;
  }
}
