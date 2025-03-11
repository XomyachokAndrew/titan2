-- Создание представления для получения дподробной информации о работниках
CREATE OR REPLACE VIEW offices_management.worker_details AS
 WITH latest_status AS (
         SELECT sw.id_worker,
            sw.id_post,
            sw.id_department,
            sw.start_date,
            sw.end_date,
            sw.id_status,
            sw.id_status_worker,
            row_number() OVER (PARTITION BY sw.id_worker ORDER BY sw.start_date DESC) AS rn  -- Нумерация строк для получения последнего статуса
           FROM offices_management.statuses_workers sw
          WHERE (sw.end_date IS NULL OR sw.end_date > CURRENT_DATE) AND sw.start_date <= CURRENT_DATE  -- Условия для активных статусов
        )
 SELECT w.id_worker,
    ls.id_status_worker,
    (((w.surname::text || ' '::text) || w.name::text) || ' '::text) || COALESCE(w.patronymic, ''::character varying)::text AS full_worker_name,  -- Формирование полного имени работника
    p.id_post,
    p.name AS post_name,
    d.id_department,
    d.name AS department_name,
    wst.id_status,
    wst.name AS status_name
   FROM offices_management.workers w
     JOIN latest_status ls ON w.id_worker = ls.id_worker AND ls.rn = 1  -- Соединение с последним статусом работника
     LEFT JOIN offices_management.workers_statuses_types wst ON ls.id_status = wst.id_status  -- Соединение с типами статусов работников
     JOIN offices_management.posts p ON ls.id_post = p.id_post  -- Соединение с должностями
     JOIN offices_management.departments d ON ls.id_department = d.id_department  -- Соединение с отделами
   WHERE
   		w.is_deleted != true;  -- Проверка, что работник не удален

-- Запрос для получения всех данных из представления worker_details
SELECT * FROM offices_management.worker_details;

_____________________________________________________________________________________

-- Создание представления для получения текущих рабочих мест и актуальных данных о них
CREATE OR REPLACE VIEW offices_management.current_workspaces AS
SELECT 
    w.id_workspace,
    w.id_room,
    w.name AS workspace_name,
    wo.id_worker,
    CONCAT_WS(' ', wo.surname, wo.name, wo.patronymic) AS full_worker_name,  
    COALESCE(s.id_status_workspace, NULL) AS id_status_workspace,  -- Получение идентификатора статуса рабочего места
    COALESCE(s.id_workspace_status_type, NULL) AS id_workspace_status_type,  -- Получение идентификатора типа статуса рабочего места
    st.name AS workspace_status_type_name,  -- Получение названия типа статуса рабочего места
    COALESCE(s.id_workspace_reservations_statuses, NULL) AS id_workspace_reservations_statuses,  -- Получение идентификатора статуса резервирования рабочего места
    wrs.name AS reservation_statuse_name,  -- Получение названия статуса резервирования
    s.start_date,
    s.end_date  
FROM 
    offices_management.workspaces w
LEFT JOIN 
    offices_management.statuses_workspaces s ON w.id_workspace = s.id_workspace
    AND (s.end_date IS NULL OR s.end_date > CURRENT_DATE)  -- Условия для активных статусов
    AND s.start_date < CURRENT_DATE  -- Проверяем, что дата начала меньше текущей даты
LEFT JOIN 
    offices_management.workspace_reservations_statuses wrs ON s.id_workspace_reservations_statuses = wrs.id_workspace_reservations_statuses  -- Соединение со статусами резервирования
LEFT JOIN 
    offices_management.workers wo ON s.id_worker = wo.id_worker  -- Соединение с работниками
LEFT JOIN 
    offices_management.workspace_statuses_types st ON s.id_workspace_status_type = st.id_workspace_status_type  -- Соединение с типами статусов рабочих мест
WHERE 
    w.is_deleted != true;  -- Проверяем, что рабочее место не удалено

-- Запрос для получения всех данных из представления current_workspaces
SELECT * FROM offices_management.current_workspaces;

_______________________________________________________________________________________________________________________________________

-- Создание представления для получения истории статусов рабочих мест
create or replace VIEW offices_management.history_workspace_statuses AS
SELECT 
	sw.id_workspace,
    sw.start_date,
    sw.end_date,
    CONCAT(wo.name, ' ', wo.surname, ' ', COALESCE(wo.patronymic, '')) AS worker_full_name  -- Формирование полного имени работника
FROM 
    offices_management.statuses_workspaces sw
LEFT JOIN  
    offices_management.workers wo ON sw.id_worker = wo.id_worker  -- Соединение с работниками

-- Запрос для получения всех данных из представления history_workspace_statuses
SELECT * FROM offices_management.history_workspace_statuses;

-- Запрос для получения информации об офисах и количестве рабочих мест
SELECT 
  o.id_office, 
  office_name,  -- Название офиса
  o.total_workspace,  -- Общее количество рабочих мест в офисе
  (o.total_workspace - count(w.workspace_name)) AS workspace  -- Вычисление количества свободных рабочих мест
FROM 
  offices_management.offices o
LEFT JOIN 
    offices_management.floors f ON o.id_office = f.id_office  -- Соединение с этажами
LEFT JOIN 
    offices_management.rooms r ON f.id_floor = r.id_floor  -- Соединение с комнатами
LEFT JOIN 
    offices_management.current_workspaces w ON r.id_room = w.id_room  -- Соединение с текущими рабочими местами
WHERE w.id_worker IS NOT NULL  -- Проверяем, что рабочее место занято
GROUP BY 
    o.id_office, o.office_name;  -- Группировка по идентификатору и названию офиса

-- Запрос для получения всех данных из представления history_workspace_statuses (дублирующийся запрос)
SELECT * FROM offices_management.history_workspace_statuses;

