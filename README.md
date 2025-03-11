# Описание
Приложение «Интерактивная Карта Офисов» (ИКО) предназначено для эффективного управления офисными пространствами. Оно позволяет пользователям размещать сотрудников в офисах, а также генерировать отчеты по использованию офисных площадей.


# Основные функции
## Размещение сотрудников:

- [ ] Возможность добавления новых сотрудников в систему.
- [ ] Назначение сотрудников на конкретные рабочие места.
- [ ] Управление перемещениями сотрудников между офисами.


## Управление офисами:

- [ ] Добавление новых офисов в систему.
- [ ] Редактирование информации о существующих офисах.
- [ ] Удаление офисов из системы.


## Генерация отчетов:

- [ ] Отчеты по заполняемости офисов.
- [ ] Отчеты по использованию рабочих мест.
- [ ] Отчеты по перемещениям сотрудников.


## Интерактивная карта:

- [ ] Визуализация расположения офисов на карте.
- [ ] Возможность просмотра информации о каждом офисе при наведении курсора.
- [ ] Технические требования


## Программное обеспечение:

- [ ] Веб-браузер (последняя версия Chrome, Firefox, Safari или Edge).
- [ ] Доступ к интернету.


## Аппаратное обеспечение:

- [ ] Компьютер или планшет с поддержкой веб-браузера.
- [ ] Установка и настройка.

# Установка

Для установки и запуска проекта вам потребуется сервер с установленным Docker. Следуйте приведенным ниже шагам:

1. **Клонируйте репозиторий**:
   Откройте терминал и выполните команду для клонирования репозитория Titan2:
   ```bash
   git clone https://github.com/XomyachokAndrew/Titan2.git
   ```

2. **Перейдите в директорию с проектом**:
   После клонирования репозитория перейдите в созданную директорию:
   ```bash
   cd titan2
   ```

3. **Запустите контейнеры**:
   После настройки переменных окружения выполните команду для запуска контейнеров с помощью Docker Compose:
   ```bash
   docker compose up -d
   ```
   Флаг `-d` запускает контейнеры в фоновом режиме.

### Проверка установки

После выполнения всех шагов вы можете проверить, что проект работает, открыв браузер и перейдя по адресу сервера. По умолчанию `http://serverip:4200`