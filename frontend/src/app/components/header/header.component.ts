import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import {
    TuiDataList,
    TuiDropdown,
    TuiDropdownService,
    TuiIcon,
    TuiTextfield,
} from '@taiga-ui/core';
import {
    TuiTabs,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { filter } from 'rxjs/operators';
import { SearchComponent } from '../searchBar/search.component';
import { Location } from '@angular/common'; // Импортируйте Location

@Component({
    selector: 'app-header',
    standalone: true,
    exportAs: "Example1",
    imports: [
        // NgClass,
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
    title: string = "Интерактивная карта офисов";
    user: string = 'Админ';
    isSearch: boolean = false;

    constructor(private router: Router, private location: Location) { }

    ngOnInit() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            switch (event.urlAfterRedirects) {
                case '/login':
                    this.loginPage = true; 
                    break;
                case '/registration':
                    this.loginPage = true;
                    break;
                case '/offices/office':
                    this.title = "Офис";
                    break;
                case '/offices':
                    this.title = "Офисы";
                    break;
                default:
                    this.title = "Интерактивная карта офисов";
                    this.loginPage = false;
                    break;
            }
            if(event.urlAfterRedirects !== "/"){
                this.isSearch = true;
            }
            else{
                this.isSearch = false;
            }
        });
    }

    goBack() {
        this.location.back(); // Метод для возврата на предыдущую страницу
    }
}
