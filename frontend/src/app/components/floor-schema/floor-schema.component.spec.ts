import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorSchemaComponent } from './floor-schema.component';

describe('FloorSchemaComponent', () => {
  let component: FloorSchemaComponent;
  let fixture: ComponentFixture<FloorSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorSchemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
