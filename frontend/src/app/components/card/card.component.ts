import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTitle, TuiIcon, TuiOption } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import {TuiAvatar} from '@taiga-ui/kit';

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
        TuiIcon, 
        TuiOption,
        TuiAvatar,
    ],
    templateUrl: './card.component.html',
    styleUrl: './card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardComponent {
    @Input() title: string = "";
    @Input() address: string = "";
    @Input() image: string = "";

}
