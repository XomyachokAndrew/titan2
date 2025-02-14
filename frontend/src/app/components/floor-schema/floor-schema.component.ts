import { Component, Input } from '@angular/core';
import { IFloor } from '../../services/models/Floor';
import { RoomSchemaComponent } from "../room-schema/room-schema.component";

@Component({
  selector: 'app-floor-schema',
  imports: [RoomSchemaComponent],
  templateUrl: './floor-schema.component.html',
  styleUrl: './floor-schema.component.css'
})
export class FloorSchemaComponent {
  @Input() floorInfo!: IFloor;

}
