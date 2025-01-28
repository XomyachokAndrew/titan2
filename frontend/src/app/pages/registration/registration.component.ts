import {
  ChangeDetectionStrategy,
  Component,
  Renderer2,
  Inject,
  OnInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'registration',
  standalone: true,
  imports: [TuiButton, ReactiveFormsModule, TuiInputModule, TuiSelectModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.documentElement, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.body, 'height', '100%');
    this.renderer.setStyle(this.document.documentElement, 'height', '100%');
    this.renderer.setStyle(this.document.body, 'margin', '0');
    this.renderer.setStyle(this.document.documentElement, 'margin', '0');
  }

  protected items = ['Администратор', 'Гость'];

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form.patchValue({
      login: '',
      password: '',
      role: '',
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form Submitted', this.form.value);
    }
  }
}
