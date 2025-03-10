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
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { TuiButton } from '@taiga-ui/core';
import { UserService } from '@controllers/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { Location } from '@angular/common'; // <-- Добавлено
import { Router } from '@angular/router';

/**
 * Компонент для регистрации нового пользователя.
 */
@Component({
  selector: 'registration',
  standalone: true,
  imports: [TuiButton, ReactiveFormsModule, TuiInputModule, TuiSelectModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationComponent implements OnInit {
  form: FormGroup; // Форма регистрации
  private isAuth: boolean = false; // Статус аутентификации
  private destroyRef = inject(DestroyRef);
  protected isAdmin: boolean = false; // Статус администратора

  /**
   * Конструктор для RegistrationComponent.
   * @param renderer - Сервис для работы с DOM.
   * @param document - Документ DOM.
   * @param fb - Сервис для создания форм.
   * @param authService - Сервис для управления аутентификацией.
   * @param location - Сервис для управления навигацией.
   * @param router - Сервис для маршрутизации.
   */
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private authService: UserService,
    private location: Location,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: [null, Validators.required],
      surname: [null, Validators.required],
      patronymic: [null, Validators.required],
      login: [null, Validators.required],
      password: [null, Validators.required],
      role: [null, Validators.required],
    });

    this.authService.isAdmin();
    if (!this.isAdmin) {
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

  /**
   * Элементы для выбора роли пользователя.
   */
  protected items = ['Администратор', 'Гость'];

  /**
   * Метод, вызываемый при инициализации компонента.
   */
  ngOnInit(): void {
    this.isAuth = this.authService.isAuthenticated();
    if (!this.isAuth) {
      this.location.back();
    }
  }

  /**
   * Метод для обработки отправки формы.
   */
  onSubmit(): void {
    console.log(this.form.value);

    if (this.form.valid) {
      const registerDto = this.form.value;
      registerDto.role = registerDto.role === 'Администратор' ? true : false;
      this.authService
        .register(registerDto)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(error => {
            console.error(error);
            return of(null);
          })
        )
        .subscribe({
          next: data => {
            this.location.back();
          },
        });
    }
  }
}
