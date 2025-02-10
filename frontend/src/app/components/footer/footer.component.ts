import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({
    selector: 'app-footer',
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
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.scss',
})
export default class FooterComponent {

}
