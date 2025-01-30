import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'main-button',
    imports: [NgStyle],
    templateUrl: './button.main.html',
    styleUrl: './button.main.scss'
})
export class ButtonMComponent {
    @Input() href: string = "";
    @Input() title: string = "";
    @Input() description: string = "";
    @Input() main: string = "";
    @Input() enter: string = "";
    @Input() height: string = "";
}
