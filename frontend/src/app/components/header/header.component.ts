import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
  TuiDataList,
  TuiDropdown,
  TuiIcon,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiTabs } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { filter } from 'rxjs/operators';
import { SearchComponent } from '@components/searchBar/search.component';
import { Location, NgClass } from '@angular/common';
import { UserService } from '@controllers/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { jwtDecode } from 'jwt-decode';

/**
 * Компонент для отображения заголовка (header) приложения.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  exportAs: 'Example1',
  imports: [
    FormsModule,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
    SearchComponent,
    NgClass,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export default class HeaderComponent implements OnInit {
  loginPage: boolean = false; // Флаг для отображения страницы входа
  isSearch: boolean = false; // Флаг для отображения поиска
  isAuthenticated: boolean = false; // Флаг для проверки аутентификации
  title: string = 'Интерактивная карта офисов'; // Заголовок приложения
  user: string = ''; // Имя пользователя или текст кнопки
  private destroyRef = inject(DestroyRef);
  isHeaderVisible = true; // Флаг для отображения заголовка
  private lastScrollPosition = 0; // Последняя позиция прокрутки
  protected role!: string | null; // Роль пользователя

  constructor(
    private router: Router,
    private location: Location,
    private userService: UserService
  ) {}

  /**
   * Метод, вызываемый при инициализации компонента.
   */
  ngOnInit() {
    this.setupRouterEvents();
    this.setupAuthentication();
    this.lastScrollPosition = window.pageYOffset;
  }

  /**
   * Метод для декодирования JWT-токена и получения роли пользователя.
   */
  private decodeToken(): void {
    const token = localStorage.getItem('token'); // Assuming you have a method to get the token
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.role = decodedToken.role;
    }
  }

  /**
   * Настройка подписки на события маршрутизации.
   * Обновляет флаг `loginPage` в зависимости от текущего URL.
   */
  private setupRouterEvents(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        this.loginPage = ['/login', '/registration'].includes(
          event.urlAfterRedirects
        );
      });
  }

  /**
   * Настройка подписки на состояние аутентификации.
   * Обновляет флаг `isAuthenticated` и текст кнопки.
   */
  private setupAuthentication(): void {
    this.userService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.user = isAuthenticated ? 'Выйти' : '';
        if (isAuthenticated) {
          this.decodeToken();
        }
      });
  }

  /**
   * Метод для возврата на предыдущую страницу.
   */
  goBack() {
    this.location.back(); // Метод для возврата на предыдущую страницу
  }

  /**
   * Метод для аутентификации или выхода из системы.
   */
  authOrLogout() {
    if (this.isAuthenticated) {
      this.userService.logout();
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Обработчик события прокрутки окна.
   * Скрывает или показывает заголовок в зависимости от направления прокрутки.
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const currentScrollPosition = window.pageYOffset;

    if (currentScrollPosition > this.lastScrollPosition) {
      // Прокрутка вниз
      this.isHeaderVisible = false;
    } else {
      // Прокрутка вверх
      this.isHeaderVisible = true;
    }

    this.lastScrollPosition = currentScrollPosition;
  }
}
