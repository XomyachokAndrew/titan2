import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { Router } from '@angular/router';
import { IOfficeDto } from '@DTO';

/**
 * CardComponent — это компонент Angular, представляющий карточку с информацией об офисе.
 * Он использует компоненты Taiga UI для стилизации и макета.
 */
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
    /**
     * Входное свойство для получения данных об офисе от родительского компонента.
     */
    @Input() data!: IOfficeDto;

    /**
     * Уникальный идентификатор для карточки офиса.
     */
    id = input<number>(0);

    /**
     * Конструктор для инициализации сервиса маршрутизации.
     * @param router - Сервис маршрутизации Angular для навигации.
     */
    constructor(
        private router: Router
    ) { }

    /**
     * Переходит к детальному представлению офиса, используя предоставленный идентификатор офиса.
     * @param id - Идентификатор офиса для перехода.
     */
    goToOffice(id: number) {
        this.router.navigate(["/offices", id]);
    }
}
