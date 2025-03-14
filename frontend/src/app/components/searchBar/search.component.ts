import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '@controllers/search.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalComponent } from '@components/modalWindow/modalWindow.component';
import { tuiDialog } from '@taiga-ui/core';
import { ModalWorkerComponent } from '@components/workerModalWindow/workerModalWindow.component';
import { TuiInputModule } from '@taiga-ui/legacy';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiDataList } from '@taiga-ui/core';

/**
 * Компонент для выполнения поиска и отображения результатов.
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  imports: [
    FormsModule,
    CommonModule,
    TuiInputModule,
    TuiDataListWrapper,
    TuiDataList,
  ],
})
export class SearchComponent {
  searchTerm: string = ''; // Поисковый запрос
  isSearchVisible: boolean = false; // Видимость строки поиска
  searchResults: any[] = []; // Результаты поиска
  private destroyRef = inject(DestroyRef);

  /**
   * Конструктор для SearchComponent.
   * @param searchService - Сервис для выполнения поиска.
   * @param router - Сервис для навигации по маршрутам.
   */
  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  /**
   * Метод для переключения видимости строки поиска.
   * @param event - Событие клика мыши.
   */
  toggleSearch(event: MouseEvent) {
    event.stopPropagation(); // Остановить всплытие события клика
    this.isSearchVisible = !this.isSearchVisible; // Переключаем видимость строки поиска
  }

  /**
   * Обработчик клика по документу для скрытия строки поиска.
   * @param event - Событие клика мыши.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Если клик был вне области поиска, скрываем поле ввода
    if (this.isSearchVisible) {
      this.isSearchVisible = false;
      this.searchTerm = '';
    }
  }

  /**
   * Метод для обработки изменения ввода в строке поиска.
   */
  onInputChange() {
    if (this.searchTerm.trim()) {
      this.searchService.searchOffices(this.searchTerm).subscribe({
        next: response => {
          this.searchResults = Object.values(response);
          // TODO Сделать поиск рабочих мест
        },
        error: error => {
          console.error('Error during search:', error);
        },
      });
    } else {
      this.searchResults = []; // Очищаем результаты, если поле ввода пустое
    }
  }

  /**
   * Диалоговое окно для комнат.
   */
  private readonly dialogRoom = tuiDialog(ModalComponent, {
    dismissible: true,
    size: 'auto',
  });

  /**
   * Диалоговое окно для работников.
   */
  private readonly dialogWorker = tuiDialog(ModalWorkerComponent, {
    dismissible: true,
    size: 'auto',
  });

  /**
   * Метод для обработки выбора результата поиска.
   * @param result - Выбранный результат.
   */
  async selectResult(result: any) {
    this.searchTerm = ''; // Устанавливаем выбранный результат в поле ввода

    if (result.idOffice) {
      await this.router.navigate(['/']);
      await this.router.navigate(['/offices', result.idOffice]);
    }
    if (result.idWorkspace) {
      console.log(result);
    } else if (result.idRoom) {
      this.dialogRoom(result)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            console.info(`Dialog emitted data = ${data}`);
          },
          complete: () => {
            console.info('Dialog closed');
          },
        });
    }
    if (result.idWorker) {
      this.dialogWorker(result)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            console.info(`Dialog emitted data = ${data}`);
          },
          complete: () => {
            console.info('Dialog closed');
          },
        });
    }

    this.searchResults = []; // Очищаем результаты после выбора
    // Дополнительная логика при выборе результата
  }
}
