import { ChangeDetectionStrategy, Component, Renderer2, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { TuiInputModule } from '@taiga-ui/legacy';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'login',
  standalone: true,
  imports: [
    TuiButton,
    ReactiveFormsModule,
    TuiInputModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document, private fb: FormBuilder) {
    this.form = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.documentElement, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.body, 'height', '100%');
    this.renderer.setStyle(this.document.documentElement, 'height', '100%');
    this.renderer.setStyle(this.document.body, 'margin', '0');
    this.renderer.setStyle(this.document.documentElement, 'margin', '0');
  }


  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Пример инициализации формы
    this.form.patchValue({
      login: '',
      password: ''
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form Submitted', this.form.value);
    }
  }
}
