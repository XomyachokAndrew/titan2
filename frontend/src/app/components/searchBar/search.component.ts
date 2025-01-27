import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  imports: [FormsModule],
})
export class SearchComponent {
    searchTerm: string = '';
    results: string[] = [];

    search() {
        if (this.searchTerm.trim() !== '') {
          // Здесь вы можете добавить логику для выполнения поиска
          // Например, вызов API или фильтрация данных
          this.results = this.performSearch(this.searchTerm);
        } else {
          this.results = [];
        }
      }
    
      performSearch(term: string): string[] {
        // Пример логики поиска
        const data = ['Angular', 'React', 'Vue', 'Svelte', 'Ember'];
        return data.filter(item => item.toLowerCase().includes(term.toLowerCase()));
      }
}
