import { Component } from '@angular/core';
import { ButtonMComponent } from "../../components/mainButton/button.main";

@Component({
  selector: 'home',
  imports: [ButtonMComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  protected mainButtons = [
    {
      title: "Офисы",
      href: "/offices",
      color: {
        main: "#217FB5",
        enter: "#195274",
      },
      height: '30rem',
      description: "Список офисов компании. Просмотр офисных мест. Распределение персонала по офисам, кабинетам."
    },
    {
      title: "Аналитика",
      href: "/",
      color: {
        main: "#29ABB3",
        enter: "#1E8E95",
      },
      height: '30rem',
      description: "Создание аналитических файлов. Отчетов и просмотр общей статистики"
    },
    {
      title: "Инструкция",
      href: "/",
      color: {
        main: "#29ABB3",
        enter: "#1E8E95",
      },
      height: '10rem',
      description: "Как пользоваться инструментами."
    }
  ];

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
