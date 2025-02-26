import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiTextfield,
} from '@taiga-ui/core';
import {
    TuiTabs,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { filter } from 'rxjs/operators';
import { SearchComponent } from '@components/searchBar/search.component';
import { Location } from '@angular/common';
import { UserService } from '@controllers/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-header',
    standalone: true,
    exportAs: "Example1",
    imports: [
        FormsModule,
        TuiDataList,
        TuiDropdown,
        TuiIcon,
        TuiNavigation,
        TuiTabs,
        TuiTextfield,
        SearchComponent
    ],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export default class HeaderComponent implements OnInit {
    loginPage: boolean = false;
    isSearch: boolean = false;
    isAuthenticated: boolean = false;
    title: string = "Интерактивная карта офисов";
    user: string = '';
    private destroyRef = inject(DestroyRef);

    constructor(
        private router: Router,
        private location: Location,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.setupRouterEvents();
        this.setupAuthentication();
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
                this.loginPage = ['/login', '/registration'].includes(event.urlAfterRedirects);
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
            });
    }

    goBack() {
        this.location.back(); // Метод для возврата на предыдущую страницу
    }

    authOrLogout() {
        if (this.isAuthenticated) {
            this.userService.logout();
            this.router.navigate(['/']);
        }
        else {
            this.router.navigate(['/login']);
        }
    }
}
