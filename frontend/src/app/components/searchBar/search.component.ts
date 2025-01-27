import { Component, Renderer2, Inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { TuiInputModule } from '@taiga-ui/legacy';
import {TuiIcon, tuiIconsProvider} from '@taiga-ui/core';
import { TuiButton } from '@taiga-ui/core';

@Component({
    selector: 'app-search',
    standalone: true,
    exportAs: "Example1",
    imports: [
        //TuiButton,
        ReactiveFormsModule,
        TuiInputModule,
        TuiIcon,
    ],
    providers: [
    ],
    templateUrl: './search.html',
    styleUrl: './search.scss',
})
export default class SearchComponent {
    
}
