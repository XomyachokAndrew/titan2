-- Функция для корректировки количества свободных рабочих мест
CREATE OR REPLACE FUNCTION offices_management.adjust_free_workspaces_count(
    p_id_workspace INT,  -- Идентификатор рабочего места
    p_change INT         -- Изменение количества свободных мест (может быть положительным или отрицательным)
)
RETURNS VOID AS $$
DECLARE
    v_id_floor INT;     -- Переменная для хранения идентификатора этажа
    v_id_office INT;    -- Переменная для хранения идентификатора офиса
BEGIN
    -- Получаем идентификаторы этажа и офиса, к которому принадлежит рабочее место
    SELECT f.id_floor, o.id_office
    INTO v_id_floor, v_id_office
    FROM offices_management.workspaces w
    JOIN offices_management.rooms r ON w.id_room = r.id_room
    JOIN offices_management.floors f ON r.id_floor = f.id_floor
    JOIN offices_management.offices o ON f.id_office = o.id_office
    WHERE w.id_workspace = p_id_workspace;

    -- Обновляем количество свободных рабочих мест на этаже
    UPDATE offices_management.floors
    SET free_workspaces = free_workspaces + p_change
    WHERE id_floor = v_id_floor;

    -- Обновляем количество свободных рабочих мест в офисе
    UPDATE offices_management.offices
    SET free_workspaces = free_workspaces + p_change
    WHERE id_office = v_id_office;
END;
$$ LANGUAGE plpgsql;

-- Функция триггера для обновления свободных рабочих мест
CREATE OR REPLACE FUNCTION offices_management.update_free_workspaces()
RETURNS TRIGGER AS $$
DECLARE
    v_previous_status_free BOOLEAN;  -- Переменная для хранения предыдущего статуса свободного рабочего места
    v_new_status_free BOOLEAN;        -- Переменная для хранения нового статуса свободного рабочего места
    v_old_status_free BOOLEAN;        -- Переменная для хранения старого статуса свободного рабочего места
BEGIN
    -- Проверяем даты: если новая дата начала >= текущей или дата окончания < текущей, ничего не делаем
    IF NEW.start_date >= CURRENT_DATE OR (NEW.end_date IS NOT NULL AND NEW.end_date < CURRENT_DATE) THEN
        RETURN NULL; -- Если даты не соответствуют, ничего не делаем
    END IF;

    -- Определяем, свободен ли новый статус
    v_new_status_free := (NEW.id_worker IS NULL AND NEW.id_workspace_reservations_statuses IS NULL AND NEW.id_workspace_status_type IS NULL);
    
    -- Определяем, свободен ли старый статус
    v_old_status_free := (OLD.id_worker IS NULL AND OLD.id_workspace_reservations_statuses IS NULL AND OLD.id_workspace_status_type IS NULL);

    -- Получаем предыдущий статус рабочего места
    SELECT (id_worker IS NULL AND id_workspace_reservations_statuses IS NULL AND id_workspace_status_type IS NULL) INTO v_previous_status_free
    FROM offices_management.statuses_workspaces
    WHERE id_workspace = NEW.id_workspace
      AND start_date < NEW.start_date
    ORDER BY start_date DESC
    LIMIT 1;

    -- Вызываем функцию для обработки изменения свободных мест
    PERFORM offices_management.adjust_free_workspaces_count(
        CASE
            WHEN TG_OP = 'INSERT' THEN NEW.id_workspace
            WHEN TG_OP = 'DELETE' THEN OLD.id_workspace
            ELSE NEW.id_workspace
        END,
        CASE
            WHEN TG_OP = 'INSERT' THEN
                CASE
                    WHEN v_previous_status_free IS NULL THEN
                        CASE
                            WHEN v_new_status_free THEN 0
                            ELSE -1
                        END
                    ELSE
                        CASE
                            WHEN v_previous_status_free AND NOT v_new_status_free THEN -1
                            WHEN NOT v_previous_status_free AND v_new_status_free THEN 1
                            ELSE 0
                        END
                END
            WHEN TG_OP = 'DELETE' THEN
                CASE
                    WHEN (OLD.start_date < CURRENT_DATE AND (OLD.end_date > CURRENT_DATE OR OLD.end_date IS NULL)) THEN 
                        CASE
                            WHEN v_old_status_free THEN 0
                            WHEN NOT v_old_status_free THEN 1
                        END
                    ELSE 0
                END
            WHEN TG_OP = 'UPDATE' THEN
                CASE
                    WHEN v_old_status_free IS NULL THEN
                        CASE
                            WHEN NOT v_new_status_free THEN -1
                            ELSE 0
                        END
                    ELSE
                        CASE
                            WHEN v_old_status_free AND NOT v_new_status_free THEN -1
                            WHEN NOT v_old_status_free AND v_new_status_free THEN 1
                            ELSE 0
                        END
                END
        END
   
    );

    -- Возвращаем NULL, так как триггеры, которые не возвращают значение, должны возвращать NULL
    RETURN NULL; 
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер, который будет срабатывать после вставки, удаления или обновления в таблице статусов рабочих мест
CREATE TRIGGER trg_update_free_workspaces
AFTER INSERT OR DELETE OR UPDATE ON offices_management.statuses_workspaces
FOR EACH ROW EXECUTE FUNCTION offices_management.update_free_workspaces();

-- Команда для удаления триггера, если это необходимо
-- DROP TRIGGER trg_update_free_workspaces ON offices_management.statuses_workspaces CASCADE;

-- Функция для подсчета свободных рабочих мест
CREATE OR REPLACE FUNCTION offices_management.count_free_workspaces()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Обновление количества свободных рабочих мест на этажах
    UPDATE offices_management.floors
    SET free_workspaces = (
        SELECT COUNT(*)
        FROM offices_management.rooms r
        JOIN offices_management.workspaces w ON r.id_room = w.id_room
        WHERE r.id_floor = floors.id_floor
          AND w.is_deleted = FALSE  -- Учитываем только не удаленные рабочие места
          AND NOT EXISTS (
              SELECT 1
              FROM offices_management.statuses_workspaces s
              WHERE s.id_workspace = w.id_workspace
                AND (s.id_worker IS NOT NULL
                OR s.id_workspace_reservations_statuses IS NOT NULL
                OR s.id_workspace_status_type IS NOT NULL)
                AND s.start_date < CURRENT_DATE  -- Проверяем, что статус был активен в прошлом
                AND (s.end_date IS NULL OR s.end_date > CURRENT_DATE)  -- Проверяем, что статус все еще активен
          )
    );

    -- Обновление количества свободных рабочих мест в офисах
    UPDATE offices_management.offices
    SET free_workspaces = (
        SELECT COUNT(*)
        FROM offices_management.floors f
        JOIN offices_management.rooms r ON f.id_floor = r.id_floor
        JOIN offices_management.workspaces w ON r.id_room = w.id_room
        WHERE f.id_office = offices.id_office
          AND w.is_deleted = FALSE  -- Учитываем только не удаленные рабочие места
          AND NOT EXISTS (
              SELECT 1
              FROM offices_management.statuses_workspaces s
              WHERE s.id_workspace = w.id_workspace
                AND (s.id_worker IS NOT NULL
                OR s.id_workspace_reservations_statuses IS NOT NULL
                OR s.id_workspace_status_type IS NOT NULL)
                AND s.start_date < CURRENT_DATE  -- Проверяем, что статус был активен в прошлом
                AND (s.end_date IS NULL OR s.end_date > CURRENT_DATE)  -- Проверяем, что статус все еще активен
          )
    );
END;
$function$;

-- Вызов функции для подсчета свободных рабочих мест
SELECT offices_management.count_free_workspaces();
