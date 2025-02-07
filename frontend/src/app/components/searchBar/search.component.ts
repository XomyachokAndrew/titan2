import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  imports: [
    FormsModule,
    CommonModule
  ],
})
export class SearchComponent {
  searchTerm: string = '';
  isSearchVisible: boolean = false;

  toggleSearch(event: MouseEvent) {
    event.stopPropagation(); // Остановить всплытие события клика
    this.isSearchVisible = !this.isSearchVisible; // Переключаем видимость строки поиска
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Если клик был вне области поиска, скрываем поле ввода
    if (this.isSearchVisible) {
      this.isSearchVisible = false;
    }
  }

  search() {
    console.log('Поиск:', this.searchTerm); // Логика поиска (можно заменить на вашу)
  }
}
