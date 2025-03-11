-- Функция для обновления статусов рабочих мест при изменении статуса работника
CREATE OR REPLACE FUNCTION update_workspace_statuses()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверяем, если работник удаляется или устанавливается флаг is_deleted
    IF (OLD.is_deleted = false AND NEW.is_deleted = true) OR (TG_OP = 'DELETE') THEN
        -- Обновляем статусы рабочих мест, устанавливая дату окончания для активных статусов
        UPDATE offices_management.statuses_workspaces
        SET 
            end_date = CURRENT_DATE  -- Устанавливаем дату окончания на текущую дату
        WHERE 
            id_worker = OLD.id_worker AND  -- Фильтруем по идентификатору работника
            start_date < CURRENT_DATE AND  -- Учитываем только статусы, которые начались до текущей даты
            (end_date >= CURRENT_DATE OR end_date IS NULL);  -- Учитываем только активные статусы

        -- Обновляем статусы рабочих мест, устанавливая id_worker в NULL для будущих статусов
        UPDATE offices_management.statuses_workspaces
        SET 
            id_worker = NULL  -- Убираем привязку работника к рабочему месту
        WHERE 
            id_worker = OLD.id_worker AND  -- Фильтруем по идентификатору работника
            start_date >= CURRENT_DATE AND  -- Учитываем только статусы, которые начнутся в будущем
            (end_date IS NULL OR end_date > CURRENT_DATE);  -- Учитываем только статусы, которые еще активны
    END IF;

    RETURN NEW;  -- Возвращаем новую запись, так как триггер срабатывает после обновления
END;
$$ LANGUAGE plpgsql;

-- Триггер, который срабатывает после обновления поля is_deleted в таблице workers
CREATE TRIGGER trg_update_worker
AFTER UPDATE OF is_deleted ON offices_management.workers
FOR EACH ROW
WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)  -- Срабатывает только при изменении значения is_deleted
EXECUTE FUNCTION update_workspace_statuses();  -- Вызывает функцию обновления статусов рабочих мест

-- Триггер, который срабатывает после удаления записи из таблицы workers
CREATE TRIGGER trg_delete_worker
AFTER DELETE ON offices_management.workers
FOR EACH ROW
EXECUTE FUNCTION update_workspace_statuses();  -- Вызывает функцию обновления статусов рабочих мест
