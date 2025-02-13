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

@Component({
    selector: 'app-loading',
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
    templateUrl: './loading.component.html',
    styleUrl: './loading.scss',
})
export default class LoadingComponent {

}
