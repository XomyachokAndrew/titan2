import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    TuiDataList,
    TuiDropdown,
    TuiTextfield,
} from '@taiga-ui/core';
import {
    TuiTabs,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';

/**
 * Компонент для отображения подвала (footer) приложения.
 */
@Component({
    selector: 'app-footer',
    standalone: true,
    exportAs: "Example1",
    imports: [
        FormsModule,
        TuiDataList,
        TuiDropdown,
        TuiNavigation,
        TuiTabs,
        TuiTextfield,
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.scss',
})
export default class FooterComponent {

}
