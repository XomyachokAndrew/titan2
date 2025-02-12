import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Router } from '@angular/router';
import { OfficeService } from '../../services/controllers/office.service';

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
    id = input<number>(0);
    title = "Головной"
    address = "ул Пушкина"
    city = "Санкт-Питербург"
    image = "img1"

    constructor(
        private officeService: OfficeService,
        private router: Router
    ) { }

    ngOnInit(): void { 
        this.officeService.getOfficesById(this.id());
    }

    goToOffice(
        id: number,
    ) {
        this.router.navigate(["/offices", id]);
    }
}
