import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSchemaComponent } from './room-schema.component';

describe('RoomSchemaComponent', () => {
  let component: RoomSchemaComponent;
  let fixture: ComponentFixture<RoomSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomSchemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
