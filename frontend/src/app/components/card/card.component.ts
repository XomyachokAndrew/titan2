import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
    selector: 'card-office',
    standalone: true,
    exportAs: "Example1",
    imports: [
        TuiAppearance,
        TuiCardLarge,
        TuiHeader,
        TuiTitle,
        TuiButton,
    ],
    templateUrl: './card.component.html',
    styleUrl: './card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardComponent implements OnInit {
    @Input() id: number = 0;
    @Input() title: string = "";
    @Input() address: string = "";
    @Input() image: string = "";

    adr = "";
    city = "";
    ngOnInit(): void {
        const parts = this.address.split(", ");
        if (parts.length >= 2) {
            this.adr = parts.slice(0, -1).join(", ");
            this.city = parts[parts.length - 1];
        }
    }
}
