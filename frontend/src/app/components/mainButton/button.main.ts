import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
    selector: 'main-button',
    imports: [NgStyle],
    templateUrl: './button.main.html',
    styleUrl: './button.main.scss'
})
export class ButtonMComponent {
    href = input<string>();
    title = input<string>();
    description = input<string>();
    main = input<string>();
    enter = input<string>();
    height = input<string>();
}
