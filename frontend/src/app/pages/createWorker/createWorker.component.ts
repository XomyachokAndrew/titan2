import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiInputModule } from '@taiga-ui/legacy';
import { TuiButton } from '@taiga-ui/core';

interface Employee {
  firstName: string;
  lastName: string;
  middleName: string;
  position: string;
  organization: string;
}

@Component({
  selector: 'createWorker',
  templateUrl: './createWorker.component.html',
  styleUrls: ['./createWorker.scss'],
  imports: [TuiButton, ReactiveFormsModule, TuiInputModule],
})
export class CreateWorkerComponent {
  employeeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      position: ['', Validators.required],
      organization: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const employee: Employee = this.employeeForm.value;
    }
  }
}
