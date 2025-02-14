import { Component, Input } from '@angular/core';
import { IRoom } from '../../services/models/Room';

@Component({
  selector: 'app-room-schema',
  imports: [],
  templateUrl: './room-schema.component.html',
  styleUrl: './room-schema.component.css'
})
export class RoomSchemaComponent {
  @Input() roomInfo!: IRoom;

  onRoomClick()
  {
    alert(this.roomInfo.name)
  }
}
