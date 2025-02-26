import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Router } from '@angular/router';
import { IOfficeDto } from '@DTO';

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
export default class CardComponent {
    @Input() data!: IOfficeDto;
    id = input<number>(0);

    constructor(
        private router: Router
    ) { }

    goToOffice(
        id: number,
    ) {
        this.router.navigate(["/offices", id]);
    }
}
