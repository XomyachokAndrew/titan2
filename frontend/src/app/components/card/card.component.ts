import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, input, OnInit } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Router } from '@angular/router';
import { OfficeService } from '../../services/controllers/office.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IOffice } from '../../services/models/Office';
import { TuiProgress } from '@taiga-ui/kit';

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
        TuiProgress
    ],
    templateUrl: './card.component.html',
    styleUrl: './card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardComponent implements OnInit {
    @Input() data: any;
    id = input<number>(0);


    constructor(
        private officeService: OfficeService,
        private router: Router
    ) { }

    ngOnInit(): void {
    }

    goToOffice(
        id: number,
    ) {
        this.router.navigate(["/offices", id]);
    }
}
