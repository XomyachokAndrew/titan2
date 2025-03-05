import {
  ChangeDetectionStrategy,
  Component,
  Renderer2,
  Inject,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { TuiInputModule } from '@taiga-ui/legacy';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';
import { UserService } from '@controllers/user.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  isAuth: boolean = false;
  private destroyRef = inject(DestroyRef);
  private alerts = inject(TuiAlertService);
  protected isAdmin: boolean = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private authService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.router.navigate(['']);
      return;
    }

    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.documentElement, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.body, 'height', '100%');
    this.renderer.setStyle(this.document.documentElement, 'height', '100%');
    this.renderer.setStyle(this.document.body, 'margin', '0');
    this.renderer.setStyle(this.document.documentElement, 'margin', '0');
  }

  ngOnInit(): void {
    this.isAuth = this.authService.isAuthenticated();
    if (this.isAuth) {
      this.router.navigate(['offices']);
    }
    this.initializeForm();
  }

  initializeForm(): void {
    // Пример инициализации формы
    this.form.patchValue({
      login: '',
      password: '',
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.alerts
        .open(
          `Поля не заполнены`,
          {
            label: 'Авторизация',
            appearance: 'negative'
          }
        )
        .subscribe();
      return;
    }

    const loginDto = this.form.value;
    this.authService
      .login(loginDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isAuth = this.authService.isAuthenticated();
          if (this.isAuth) {
            this.router.navigate(['offices']);
          }
        },
        error: error => {
          console.error('Failed', error);
          this.alerts
            .open(
              `Логин или пароль введены неправильно`,
              {
                label: 'Авторизация',
                appearance: 'negative'
              }
            )
            .subscribe();
        },
      });
  }
}
