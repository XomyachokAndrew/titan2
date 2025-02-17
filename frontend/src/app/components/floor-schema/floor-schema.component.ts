import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SafeHtmlPipe } from '../../services/safe-html.pipe';
import { NgFor } from '@angular/common';
import { IFloorDto } from '../../services/models/DTO';

@Component({
  selector: 'app-floor-schema',
  imports: [SafeHtmlPipe, NgFor],
  templateUrl: './floor-schema.component.html',
  styleUrl: './floor-schema.component.css'
})
export class FloorSchemaComponent implements OnInit, OnChanges  {
  @Input() floorInfo!: IFloorDto;
  rooms: any = [];
  matches: RegExpStringIterator<RegExpExecArray> | undefined;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (this.floorInfo.schemeContent) {
      this.processSvg(this.floorInfo.schemeContent)
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['floorInfo']) {
      console.log('Floor info changed:', changes['floorInfo'].currentValue);
      this.processSvg(changes['floorInfo'].currentValue.schemeContent);
      this.cdr.detectChanges(); // Вручную запускаем обновление
    }
  }

  processSvg(svgText: string): void {
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const linkElements = doc.querySelectorAll('a');
    linkElements.forEach(link => {
      // Получаем содержимое тега <a>
      const linkContent = link.innerHTML;

      // Создаем новый элемент, который будет содержать внутренний HTML тега <a>
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = linkContent;

      // Заменяем тег <a> его содержимым
      link.replaceWith(...Array.from(tempDiv.childNodes));

      // Если нужно сохранить измененный HTML в массив rooms
      this.rooms.push(linkContent);
    });
  }

  onRoomClick(id: number) {
    alert(`${JSON.stringify(this.floorInfo.rooms[id])} ${id}`);
  }
}
