-- Функция для корректировки общего количества рабочих пространств в комнате, этаже и офисе
CREATE OR REPLACE FUNCTION offices_management.adjust_total_workspaces_count(
    p_id_room INT,  -- Идентификатор комнаты
    p_change INT    -- Изменение количества рабочих пространств (может быть положительным или отрицательным)
)
RETURNS VOID AS $$
DECLARE
    v_id_floor INT;  -- Переменная для хранения идентификатора этажа
    v_id_office INT; -- Переменная для хранения идентификатора офиса
BEGIN
    -- Получаем идентификаторы этажа и офиса, к которому принадлежит комната
    SELECT id_floor, (SELECT id_office FROM offices_management.floors WHERE id_floor = r.id_floor)
    INTO v_id_floor, v_id_office
    FROM offices_management.rooms r
    WHERE r.id_room = p_id_room;

    -- Обновляем количество рабочих пространств в комнате
    UPDATE offices_management.rooms
    SET total_workspace = total_workspace + p_change
    WHERE id_room = p_id_room;

    -- Обновляем количество рабочих пространств на этаже
    UPDATE offices_management.floors
    SET total_workspace = total_workspace + p_change
    WHERE id_floor = v_id_floor;

    -- Обновляем количество рабочих пространств в офисе
    UPDATE offices_management.offices
    SET total_workspace = total_workspace + p_change
    WHERE id_office = v_id_office;
END;
$$ LANGUAGE plpgsql;

-- Функция триггера для обновления количества рабочих пространств
CREATE OR REPLACE FUNCTION offices_management.update_workspaces_count()
RETURNS TRIGGER AS $$
DECLARE
    v_is_current_status_free BOOLEAN;  -- Переменная для хранения статуса свободного рабочего места
    v_current_start_date DATE;         -- Переменная для хранения даты начала статуса
    v_current_end_date DATE;           -- Переменная для хранения даты окончания статуса
    v_current_id_worker INT;           -- Переменная для хранения идентификатора работника
    v_current_id_workspace_reservations_statuses INT; -- Переменная для хранения идентификатора статуса резервирования рабочего места
    v_current_id_workspace_status_type INT; -- Переменная для хранения идентификатора типа статуса рабочего места
BEGIN
    -- Получаем текущий статус рабочего места
    SELECT s.start_date, s.end_date, s.id_worker, s.id_workspace_reservations_statuses, s.id_workspace_status_type
    INTO v_current_start_date, v_current_end_date, v_current_id_worker, v_current_id_workspace_reservations_statuses, v_current_id_workspace_status_type
    FROM offices_management.statuses_workspaces s
    WHERE s.id_workspace = NEW.id_workspace
      AND s.start_date < CURRENT_DATE
      AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
    ORDER BY s.start_date DESC
    LIMIT 1;

    -- Определяем, свободно ли текущее рабочее место
    v_is_current_status_free := (v_current_id_worker IS NULL AND v_current_id_workspace_reservations_statuses IS NULL AND v_current_id_workspace_status_type IS NULL);

    -- Обработка операции вставки
    IF TG_OP = 'INSERT' THEN
        PERFORM offices_management.adjust_total_workspaces_count(NEW.id_room, 1);  -- Увеличиваем общее количество рабочих пространств в комнате
        PERFORM offices_management.adjust_free_workspaces_count(NEW.id_workspace, 1); -- Увеличиваем количество свободных рабочих мест

    ELSIF TG_OP = 'DELETE' THEN
        -- Проверяем, что флаг is_deleted равен false
        IF OLD.is_deleted = false THEN
            -- Если текущее рабочее место свободно, уменьшаем свободные места на 1
            IF v_is_current_status_free THEN
                PERFORM offices_management.adjust_free_workspaces_count(OLD.id_workspace, -1); -- Уменьшаем количество свободных рабочих мест
            END IF;
            PERFORM offices_management.adjust_total_workspaces_count(OLD.id_room, -1); -- Уменьшаем общее количество рабочих пространств в комнате
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Проверяем, изменился ли статус is_deleted
        IF NEW.is_deleted <> OLD.is_deleted THEN
            IF NEW.is_deleted THEN
                -- Если статус стал удаленным, проверяем текущий статус
                IF v_is_current_status_free THEN
                    PERFORM offices_management.adjust_free_workspaces_count(NEW.id_workspace, -1); -- Уменьшаем количество свободных рабочих мест
                END IF;
                                PERFORM offices_management.adjust_total_workspaces_count(NEW.id_room, -1); -- Уменьшаем общее количество рабочих пространств в комнате
            ELSE
                -- Если статус стал активным, проверяем текущий статус
                IF v_is_current_status_free THEN
                    PERFORM offices_management.adjust_free_workspaces_count(NEW.id_workspace, 1); -- Увеличиваем количество свободных рабочих мест
                END IF;
                PERFORM offices_management.adjust_total_workspaces_count(NEW.id_room, 1); -- Увеличиваем общее количество рабочих пространств в комнате
            END IF;
        END IF;
    END IF;

    RETURN NULL; -- Триггеры, которые не возвращают значение, должны возвращать NULL
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер, который будет срабатывать после вставки, удаления или обновления в таблице рабочих мест
CREATE TRIGGER trg_update_workspaces_count
AFTER INSERT OR DELETE OR UPDATE ON offices_management.workspaces
FOR EACH ROW EXECUTE FUNCTION offices_management.update_workspaces_count();

-- Удаляем триггер, если это необходимо
DROP TRIGGER trg_update_total_workspaces ON offices_management.workspaces CASCADE;

-- Функция для подсчета общего количества рабочих пространств
CREATE OR REPLACE FUNCTION offices_management.count_total_workspaces()
RETURNS VOID AS $$
BEGIN
    -- Обновление общего количества рабочих пространств в кабинетах
    UPDATE offices_management.rooms
    SET total_workspace = (
        SELECT COUNT(*)
        FROM offices_management.workspaces
        WHERE id_room = rooms.id_room AND is_deleted = FALSE -- Учитываем только не удаленные рабочие места
    );

    -- Обновление общего количества рабочих пространств на этажах
    UPDATE offices_management.floors
    SET total_workspace = (
        SELECT COUNT(*)
        FROM offices_management.rooms
        JOIN offices_management.workspaces ON rooms.id_room = workspaces.id_room
        WHERE rooms.id_floor = floors.id_floor AND workspaces.is_deleted = FALSE -- Учитываем только не удаленные рабочие места
    );

    -- Обновление общего количества рабочих пространств в офисах
    UPDATE offices_management.offices
    SET total_workspace = (
        SELECT COUNT(*)
        FROM offices_management.floors
        JOIN offices_management.rooms ON floors.id_floor = rooms.id_floor
        JOIN offices_management.workspaces ON rooms.id_room = workspaces.id_room
        WHERE floors.id_office = offices.id_office AND workspaces.is_deleted = FALSE -- Учитываем только не удаленные рабочие места
    );
END;
$$ LANGUAGE plpgsql;

-- Вызов функции для первоначального обновления общего количества рабочих пространств
SELECT offices_management.count_total_workspaces();

