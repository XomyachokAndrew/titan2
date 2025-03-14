--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-03-11 08:47:01

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 16402)
-- Name: offices_management; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA offices_management;


ALTER SCHEMA offices_management OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 25639)
-- Name: adjust_free_workspaces_count(integer, integer); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.adjust_free_workspaces_count(p_id_workspace integer, p_change integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_floor INT;
    v_id_office INT;
BEGIN
    -- Получаем идентификаторы этажа и офиса
    SELECT f.id_floor, o.id_office
    INTO v_id_floor, v_id_office
    FROM offices_management.workspaces w
    JOIN offices_management.rooms r ON w.id_room = r.id_room
    JOIN offices_management.floors f ON r.id_floor = f.id_floor
    JOIN offices_management.offices o ON f.id_office = o.id_office
    WHERE w.id_workspace = p_id_workspace;

    -- Обновляем количество свободных рабочих мест на этаже и в офисе
    UPDATE offices_management.floors
    SET free_workspaces = free_workspaces + p_change
    WHERE id_floor = v_id_floor;

    UPDATE offices_management.offices
    SET free_workspaces = free_workspaces + p_change
    WHERE id_office = v_id_office;
END;
$$;


ALTER FUNCTION offices_management.adjust_free_workspaces_count(p_id_workspace integer, p_change integer) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 25635)
-- Name: adjust_total_workspaces_count(integer, integer); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.adjust_total_workspaces_count(p_id_room integer, p_change integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_floor INT;
    v_id_office INT;
BEGIN
    -- Получаем идентификаторы этажа и офиса
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
$$;


ALTER FUNCTION offices_management.adjust_total_workspaces_count(p_id_room integer, p_change integer) OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 25642)
-- Name: count_free_workspaces(); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.count_free_workspaces() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN

    -- Обновление количества свободных рабочих мест на этажах
    UPDATE offices_management.floors
    SET free_workspaces = (
        SELECT COUNT(*)
        FROM offices_management.rooms r
        JOIN offices_management.workspaces w ON r.id_room = w.id_room
        WHERE r.id_floor = floors.id_floor
          AND w.is_deleted = FALSE
          AND NOT EXISTS (
              SELECT 1
              FROM offices_management.statuses_workspaces s
              WHERE s.id_workspace = w.id_workspace
                AND (s.id_worker IS NOT NULL
                OR s.id_workspace_reservations_statuses IS NOT NULL
                OR s.id_workspace_status_type IS NOT NULL)
                AND s.start_date < CURRENT_DATE
                AND (s.end_date IS NULL OR s.end_date > CURRENT_DATE)
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
          AND w.is_deleted = FALSE
          AND NOT EXISTS (
              SELECT 1
              FROM offices_management.statuses_workspaces s
              WHERE s.id_workspace = w.id_workspace
                AND (s.id_worker IS NOT NULL
                OR s.id_workspace_reservations_statuses IS NOT NULL
                OR s.id_workspace_status_type IS NOT NULL)
                AND s.start_date < CURRENT_DATE
                AND (s.end_date IS NULL OR s.end_date > CURRENT_DATE)
          )
    );
END;
$$;


ALTER FUNCTION offices_management.count_free_workspaces() OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 25643)
-- Name: count_total_workspaces(); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.count_total_workspaces() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Обновление общего количества рабочих пространств в кабинетах
    UPDATE offices_management.rooms
    SET total_workspace = (
        SELECT COUNT(*)
        FROM offices_management.workspaces
        WHERE id_room = rooms.id_room AND is_deleted = FALSE
    );

    -- Обновление общего количества рабочих пространств на этажах
    UPDATE offices_management.floors
    SET total_workspace = (
        SELECT COUNT(*)
        FROM offices_management.rooms
        JOIN offices_management.workspaces ON rooms.id_room = workspaces.id_room
        WHERE rooms.id_floor = floors.id_floor AND workspaces.is_deleted = FALSE
    );

    -- Обновление общего количества рабочих пространств в офисах
    UPDATE offices_management.offices
    SET total_workspace = (
        SELECT COUNT(*)
        FROM offices_management.floors
        JOIN offices_management.rooms ON floors.id_floor = rooms.id_floor
        JOIN offices_management.workspaces ON rooms.id_room = workspaces.id_room
        WHERE floors.id_office = offices.id_office AND workspaces.is_deleted = FALSE
    );
END;
$$;


ALTER FUNCTION offices_management.count_total_workspaces() OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 25640)
-- Name: update_free_workspaces(); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.update_free_workspaces() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_previous_status_free BOOLEAN;
    v_new_status_free BOOLEAN;
	v_old_status_free BOOLEAN;
BEGIN
    -- Проверяем даты
    IF NEW.start_date >= CURRENT_DATE OR (NEW.end_date IS NOT NULL AND NEW.end_date < CURRENT_DATE) THEN
        RETURN NULL; -- Если даты не соответствуют, ничего не делаем
    END IF;

    -- Определяем, свободен ли новый статус
    v_new_status_free := (NEW.id_worker IS NULL AND NEW.id_workspace_reservations_statuses IS NULL AND NEW.id_workspace_status_type IS NULL);
	
	v_old_status_free := (OLD.id_worker IS NULL AND OLD.id_workspace_reservations_statuses IS NULL AND OLD.id_workspace_status_type IS NULL);

    -- Получаем предыдущий статус рабочего места
    SELECT (id_worker IS NULL AND id_workspace_reservations_statuses IS NULL AND id_workspace_status_type IS NULL) INTO v_previous_status_free
    FROM offices_management.statuses_workspaces
    WHERE id_workspace = NEW.id_workspace
      AND start_date < NEW.start_date
    ORDER BY start_date DESC
    LIMIT 1;

    -- Функция для обработки изменения свободных мест
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

    RETURN NULL; -- Триггеры, которые не возвращают значение, должны возвращать NULL
END;
$$;


ALTER FUNCTION offices_management.update_free_workspaces() OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 25633)
-- Name: update_workspaces_count(); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.update_workspaces_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_is_current_status_free BOOLEAN;
    v_current_start_date DATE;
    v_current_end_date DATE;
    v_current_id_worker INT;
    v_current_id_workspace_reservations_statuses INT;
    v_current_id_workspace_status_type INT;
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

    IF TG_OP = 'INSERT' THEN
        PERFORM offices_management.adjust_total_workspaces_count(NEW.id_room, 1);
        PERFORM offices_management.adjust_free_workspaces_count(NEW.id_workspace, 1);

    ELSIF TG_OP = 'DELETE' THEN
        -- Проверяем, что флаг is_deleted равен false
        IF OLD.is_deleted = false THEN
            -- Если текущее рабочее место свободно, уменьшаем свободные места на 1
            IF v_is_current_status_free THEN
                PERFORM offices_management.adjust_free_workspaces_count(OLD.id_workspace, -1);
            END IF;
            PERFORM offices_management.adjust_total_workspaces_count(OLD.id_room, -1);
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Проверяем, изменился ли статус is_deleted
        IF NEW.is_deleted <> OLD.is_deleted THEN
            IF NEW.is_deleted THEN
                -- Если статус стал удаленным, проверяем текущий статус
                IF v_is_current_status_free THEN
                    PERFORM offices_management.adjust_free_workspaces_count(NEW.id_workspace, -1);
                END IF;
                PERFORM offices_management.adjust_total_workspaces_count(NEW.id_room, -1);
            ELSE
                -- Если статус стал активным, проверяем текущий статус
                IF v_is_current_status_free THEN
                    PERFORM offices_management.adjust_free_workspaces_count(NEW.id_workspace, 1);
                END IF;
                PERFORM offices_management.adjust_total_workspaces_count(NEW.id_room, 1);
            END IF;
        END IF;
    END IF;

    RETURN NULL; -- Триггеры, которые не возвращают значение, должны возвращать NULL
END;
$$;


ALTER FUNCTION offices_management.update_workspaces_count() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 243 (class 1259 OID 16961)
-- Name: statuses_workspaces; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.statuses_workspaces (
    id_status_workspace integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    id_workspace integer NOT NULL,
    id_workspace_status_type integer,
    id_worker integer,
    id_user integer NOT NULL,
    id_workspace_reservations_statuses integer
);


ALTER TABLE offices_management.statuses_workspaces OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16927)
-- Name: workers; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workers (
    id_worker integer NOT NULL,
    name character varying(50) NOT NULL,
    surname character varying(50) NOT NULL,
    patronymic character varying(50),
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE offices_management.workers OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 17347)
-- Name: workspace_reservations_statuses; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workspace_reservations_statuses (
    id_workspace_reservations_statuses integer NOT NULL,
    name character varying(45),
    descriptions character varying(300)
);


ALTER TABLE offices_management.workspace_reservations_statuses OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16918)
-- Name: workspace_statuses_types; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workspace_statuses_types (
    id_workspace_status_type integer NOT NULL,
    name character varying(45) NOT NULL,
    descriptions character varying(300)
);


ALTER TABLE offices_management.workspace_statuses_types OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16889)
-- Name: workspaces; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workspaces (
    id_workspace integer NOT NULL,
    name character varying(45) NOT NULL,
    id_room integer NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE offices_management.workspaces OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17393)
-- Name: current_workspaces; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.current_workspaces AS
 SELECT w.id_workspace,
    w.id_room,
    w.name AS workspace_name,
    wo.id_worker,
    concat_ws(' '::text, wo.surname, wo.name, wo.patronymic) AS full_worker_name,
    COALESCE(s.id_status_workspace, NULL::integer) AS id_status_workspace,
    COALESCE(s.id_workspace_status_type, NULL::integer) AS id_workspace_status_type,
    st.name AS workspace_status_type_name,
    COALESCE(s.id_workspace_reservations_statuses, NULL::integer) AS id_workspace_reservations_statuses,
    wrs.name AS reservation_statuse_name,
    s.start_date,
    s.end_date
   FROM ((((offices_management.workspaces w
     LEFT JOIN offices_management.statuses_workspaces s ON (((w.id_workspace = s.id_workspace) AND ((s.end_date IS NULL) OR (s.end_date > CURRENT_DATE)) AND (s.start_date < CURRENT_DATE))))
     LEFT JOIN offices_management.workspace_reservations_statuses wrs ON ((s.id_workspace_reservations_statuses = wrs.id_workspace_reservations_statuses)))
     LEFT JOIN offices_management.workers wo ON ((s.id_worker = wo.id_worker)))
     LEFT JOIN offices_management.workspace_statuses_types st ON ((s.id_workspace_status_type = st.id_workspace_status_type)))
  WHERE (w.is_deleted <> true);


ALTER VIEW offices_management.current_workspaces OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16799)
-- Name: departments; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.departments (
    id_department integer NOT NULL,
    name character varying(200) NOT NULL,
    descriptions character varying(500)
);


ALTER TABLE offices_management.departments OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16798)
-- Name: departments_id_department_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.departments_id_department_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.departments_id_department_seq OWNER TO postgres;

--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 218
-- Name: departments_id_department_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.departments_id_department_seq OWNED BY offices_management.departments.id_department;


--
-- TOC entry 225 (class 1259 OID 16826)
-- Name: floors; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.floors (
    id_floor integer NOT NULL,
    number_floor smallint NOT NULL,
    total_workspace integer DEFAULT 0 NOT NULL,
    id_office integer NOT NULL,
    square integer,
    free_workspaces integer DEFAULT 0 NOT NULL,
    scheme character varying NOT NULL
);


ALTER TABLE offices_management.floors OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16825)
-- Name: floors_id_floor_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.floors_id_floor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.floors_id_floor_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 224
-- Name: floors_id_floor_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.floors_id_floor_seq OWNED BY offices_management.floors.id_floor;


--
-- TOC entry 257 (class 1259 OID 25671)
-- Name: history_workspace_statuses; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.history_workspace_statuses AS
 SELECT sw.id_workspace,
    sw.start_date,
    sw.end_date,
    concat(wo.name, ' ', wo.surname, ' ', COALESCE(wo.patronymic, ''::character varying)) AS worker_full_name
   FROM (offices_management.statuses_workspaces sw
     LEFT JOIN offices_management.workers wo ON ((sw.id_worker = wo.id_worker)));


ALTER VIEW offices_management.history_workspace_statuses OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16808)
-- Name: offices; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.offices (
    id_office integer NOT NULL,
    office_name character varying(100) NOT NULL,
    address character varying(200) NOT NULL,
    id_office_status integer NOT NULL,
    square integer,
    image character varying(100),
    total_workspace integer DEFAULT 0 NOT NULL,
    city character varying(30) NOT NULL,
    free_workspaces integer DEFAULT 0 NOT NULL
);


ALTER TABLE offices_management.offices OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16807)
-- Name: offices_id_office_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.offices_id_office_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.offices_id_office_seq OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 220
-- Name: offices_id_office_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.offices_id_office_seq OWNED BY offices_management.offices.id_office;


--
-- TOC entry 247 (class 1259 OID 17040)
-- Name: offices_status; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.offices_status (
    id_office_status integer NOT NULL,
    name character varying(30) NOT NULL
);


ALTER TABLE offices_management.offices_status OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17039)
-- Name: offices_status_id_office_status_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

ALTER TABLE offices_management.offices_status ALTER COLUMN id_office_status ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME offices_management.offices_status_id_office_status_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 16838)
-- Name: posts; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.posts (
    id_post integer NOT NULL,
    name character varying(200) NOT NULL,
    descriptions character varying(500)
);


ALTER TABLE offices_management.posts OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16837)
-- Name: posts_id_post_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.posts_id_post_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.posts_id_post_seq OWNER TO postgres;

--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 226
-- Name: posts_id_post_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.posts_id_post_seq OWNED BY offices_management.posts.id_post;


--
-- TOC entry 229 (class 1259 OID 16847)
-- Name: rental_agreements; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.rental_agreements (
    id_rental_agreement integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    price integer NOT NULL,
    document character varying(100),
    id_office integer NOT NULL,
    id_user integer NOT NULL
);


ALTER TABLE offices_management.rental_agreements OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16846)
-- Name: rental_agreements_id_rental_agreement_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.rental_agreements_id_rental_agreement_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.rental_agreements_id_rental_agreement_seq OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 228
-- Name: rental_agreements_id_rental_agreement_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.rental_agreements_id_rental_agreement_seq OWNED BY offices_management.rental_agreements.id_rental_agreement;


--
-- TOC entry 231 (class 1259 OID 16864)
-- Name: reports; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.reports (
    id_report integer NOT NULL,
    id_reports_types integer NOT NULL,
    create_date date NOT NULL,
    content character varying(100),
    id_user integer NOT NULL
);


ALTER TABLE offices_management.reports OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16863)
-- Name: reports_id_report_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.reports_id_report_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.reports_id_report_seq OWNER TO postgres;

--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 230
-- Name: reports_id_report_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.reports_id_report_seq OWNED BY offices_management.reports.id_report;


--
-- TOC entry 245 (class 1259 OID 17005)
-- Name: reports_types; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.reports_types (
    id_reports_types integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE offices_management.reports_types OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17004)
-- Name: reports_types_id_reports_types_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

ALTER TABLE offices_management.reports_types ALTER COLUMN id_reports_types ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME offices_management.reports_types_id_reports_types_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 249 (class 1259 OID 17097)
-- Name: room_status; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.room_status (
    id_room_status integer NOT NULL,
    name character varying(30) NOT NULL,
    descriptions character varying(100)
);


ALTER TABLE offices_management.room_status OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 17096)
-- Name: room_status_id_room_status_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

ALTER TABLE offices_management.room_status ALTER COLUMN id_room_status ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME offices_management.room_status_id_room_status_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 16876)
-- Name: rooms; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.rooms (
    id_room integer NOT NULL,
    name character varying(45) NOT NULL,
    total_workspace integer DEFAULT 0 NOT NULL,
    id_floor integer NOT NULL,
    square integer,
    id_room_status integer
);


ALTER TABLE offices_management.rooms OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16875)
-- Name: rooms_id_room_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.rooms_id_room_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.rooms_id_room_seq OWNER TO postgres;

--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 232
-- Name: rooms_id_room_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.rooms_id_room_seq OWNED BY offices_management.rooms.id_room;


--
-- TOC entry 236 (class 1259 OID 16917)
-- Name: statuses_id_statuses_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.statuses_id_statuses_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.statuses_id_statuses_seq OWNER TO postgres;

--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 236
-- Name: statuses_id_statuses_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.statuses_id_statuses_seq OWNED BY offices_management.workspace_statuses_types.id_workspace_status_type;


--
-- TOC entry 241 (class 1259 OID 16934)
-- Name: statuses_workers; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.statuses_workers (
    id_status_worker integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    id_post integer NOT NULL,
    id_department integer NOT NULL,
    id_worker integer NOT NULL,
    id_user integer NOT NULL,
    id_status integer
);


ALTER TABLE offices_management.statuses_workers OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16933)
-- Name: statuses_workers_id_status_worker_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.statuses_workers_id_status_worker_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.statuses_workers_id_status_worker_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 240
-- Name: statuses_workers_id_status_worker_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.statuses_workers_id_status_worker_seq OWNED BY offices_management.statuses_workers.id_status_worker;


--
-- TOC entry 242 (class 1259 OID 16960)
-- Name: statuses_workspaces_id_status_workspace_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.statuses_workspaces_id_status_workspace_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.statuses_workspaces_id_status_workspace_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 242
-- Name: statuses_workspaces_id_status_workspace_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.statuses_workspaces_id_status_workspace_seq OWNED BY offices_management.statuses_workspaces.id_status_workspace;


--
-- TOC entry 223 (class 1259 OID 16816)
-- Name: users; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.users (
    id_user integer NOT NULL,
    login character varying(20) NOT NULL,
    password bytea NOT NULL,
    name character varying(50) NOT NULL,
    surname character varying(50) NOT NULL,
    patronymic character varying(50),
    is_admin boolean DEFAULT false NOT NULL,
    refresh_token character varying
);


ALTER TABLE offices_management.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16815)
-- Name: users_id_user_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.users_id_user_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.users_id_user_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.users_id_user_seq OWNED BY offices_management.users.id_user;


--
-- TOC entry 252 (class 1259 OID 17311)
-- Name: workers_statuses_types; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workers_statuses_types (
    id_status integer NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(500)
);


ALTER TABLE offices_management.workers_statuses_types OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 25663)
-- Name: worker_details; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.worker_details AS
 WITH latest_status AS (
         SELECT sw.id_worker,
            sw.id_post,
            sw.id_department,
            sw.start_date,
            sw.end_date,
            sw.id_status,
            sw.id_status_worker,
            row_number() OVER (PARTITION BY sw.id_worker ORDER BY sw.start_date DESC) AS rn
           FROM offices_management.statuses_workers sw
          WHERE (((sw.end_date IS NULL) OR (sw.end_date > CURRENT_DATE)) AND (sw.start_date <= CURRENT_DATE))
        )
 SELECT w.id_worker,
    ls.id_status_worker,
    (((((w.surname)::text || ' '::text) || (w.name)::text) || ' '::text) || (COALESCE(w.patronymic, ''::character varying))::text) AS full_worker_name,
    p.id_post,
    p.name AS post_name,
    d.id_department,
    d.name AS department_name,
    wst.id_status,
    wst.name AS status_name
   FROM ((((offices_management.workers w
     JOIN latest_status ls ON (((w.id_worker = ls.id_worker) AND (ls.rn = 1))))
     LEFT JOIN offices_management.workers_statuses_types wst ON ((ls.id_status = wst.id_status)))
     JOIN offices_management.posts p ON ((ls.id_post = p.id_post)))
     JOIN offices_management.departments d ON ((ls.id_department = d.id_department)))
  WHERE (w.is_deleted <> true);


ALTER VIEW offices_management.worker_details OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16926)
-- Name: workers_id_worker_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.workers_id_worker_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.workers_id_worker_seq OWNER TO postgres;

--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 238
-- Name: workers_id_worker_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.workers_id_worker_seq OWNED BY offices_management.workers.id_worker;


--
-- TOC entry 251 (class 1259 OID 17310)
-- Name: workers_statuses_types_id_status_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

ALTER TABLE offices_management.workers_statuses_types ALTER COLUMN id_status ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME offices_management.workers_statuses_types_id_status_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16888)
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.workspaces_id_workspace_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.workspaces_id_workspace_seq OWNER TO postgres;

--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 234
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.workspaces_id_workspace_seq OWNED BY offices_management.workspaces.id_workspace;


--
-- TOC entry 253 (class 1259 OID 17346)
-- Name: workspaces_reservations _stat_id_workspaces_reservations _s_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

ALTER TABLE offices_management.workspace_reservations_statuses ALTER COLUMN id_workspace_reservations_statuses ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME offices_management."workspaces_reservations _stat_id_workspaces_reservations _s_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4850 (class 2604 OID 16802)
-- Name: departments id_department; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.departments ALTER COLUMN id_department SET DEFAULT nextval('offices_management.departments_id_department_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 16829)
-- Name: floors id_floor; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors ALTER COLUMN id_floor SET DEFAULT nextval('offices_management.floors_id_floor_seq'::regclass);


--
-- TOC entry 4851 (class 2604 OID 17065)
-- Name: offices id_office; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices ALTER COLUMN id_office SET DEFAULT nextval('offices_management.offices_id_office_seq'::regclass);


--
-- TOC entry 4859 (class 2604 OID 16841)
-- Name: posts id_post; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.posts ALTER COLUMN id_post SET DEFAULT nextval('offices_management.posts_id_post_seq'::regclass);


--
-- TOC entry 4860 (class 2604 OID 16850)
-- Name: rental_agreements id_rental_agreement; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements ALTER COLUMN id_rental_agreement SET DEFAULT nextval('offices_management.rental_agreements_id_rental_agreement_seq'::regclass);


--
-- TOC entry 4861 (class 2604 OID 16867)
-- Name: reports id_report; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports ALTER COLUMN id_report SET DEFAULT nextval('offices_management.reports_id_report_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 16879)
-- Name: rooms id_room; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms ALTER COLUMN id_room SET DEFAULT nextval('offices_management.rooms_id_room_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 16937)
-- Name: statuses_workers id_status_worker; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers ALTER COLUMN id_status_worker SET DEFAULT nextval('offices_management.statuses_workers_id_status_worker_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 16964)
-- Name: statuses_workspaces id_status_workspace; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces ALTER COLUMN id_status_workspace SET DEFAULT nextval('offices_management.statuses_workspaces_id_status_workspace_seq'::regclass);


--
-- TOC entry 4854 (class 2604 OID 16819)
-- Name: users id_user; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users ALTER COLUMN id_user SET DEFAULT nextval('offices_management.users_id_user_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16930)
-- Name: workers id_worker; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers ALTER COLUMN id_worker SET DEFAULT nextval('offices_management.workers_id_worker_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 16921)
-- Name: workspace_statuses_types id_workspace_status_type; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_statuses_types ALTER COLUMN id_workspace_status_type SET DEFAULT nextval('offices_management.statuses_id_statuses_seq'::regclass);


--
-- TOC entry 4864 (class 2604 OID 16892)
-- Name: workspaces id_workspace; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces ALTER COLUMN id_workspace SET DEFAULT nextval('offices_management.workspaces_id_workspace_seq'::regclass);


--
-- TOC entry 5089 (class 0 OID 16799)
-- Dependencies: 219
-- Data for Name: departments; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5095 (class 0 OID 16826)
-- Dependencies: 225
-- Data for Name: floors; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5091 (class 0 OID 16808)
-- Dependencies: 221
-- Data for Name: offices; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5117 (class 0 OID 17040)
-- Dependencies: 247
-- Data for Name: offices_status; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5097 (class 0 OID 16838)
-- Dependencies: 227
-- Data for Name: posts; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5099 (class 0 OID 16847)
-- Dependencies: 229
-- Data for Name: rental_agreements; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5101 (class 0 OID 16864)
-- Dependencies: 231
-- Data for Name: reports; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5115 (class 0 OID 17005)
-- Dependencies: 245
-- Data for Name: reports_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.reports_types OVERRIDING SYSTEM VALUE VALUES (1, 'Распределение аренды');
INSERT INTO offices_management.reports_types OVERRIDING SYSTEM VALUE VALUES (2, 'Реестр рабочих мест');


--
-- TOC entry 5119 (class 0 OID 17097)
-- Dependencies: 249
-- Data for Name: room_status; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5103 (class 0 OID 16876)
-- Dependencies: 233
-- Data for Name: rooms; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5111 (class 0 OID 16934)
-- Dependencies: 241
-- Data for Name: statuses_workers; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5113 (class 0 OID 16961)
-- Dependencies: 243
-- Data for Name: statuses_workspaces; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5093 (class 0 OID 16816)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.users VALUES (1, 'admin', '\x8cdd9346bbdb6f67e399c48eaca610ea030fb6f2131bb43680e077c14a688cc9', 'admin', 'admin', NULL, true, NULL);


--
-- TOC entry 5109 (class 0 OID 16927)
-- Dependencies: 239
-- Data for Name: workers; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5121 (class 0 OID 17311)
-- Dependencies: 252
-- Data for Name: workers_statuses_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5123 (class 0 OID 17347)
-- Dependencies: 254
-- Data for Name: workspace_reservations_statuses; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5107 (class 0 OID 16918)
-- Dependencies: 237
-- Data for Name: workspace_statuses_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5105 (class 0 OID 16889)
-- Dependencies: 235
-- Data for Name: workspaces; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 218
-- Name: departments_id_department_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.departments_id_department_seq', 1, false);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 224
-- Name: floors_id_floor_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.floors_id_floor_seq', 1, false);


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 220
-- Name: offices_id_office_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.offices_id_office_seq', 1, false);


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 246
-- Name: offices_status_id_office_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.offices_status_id_office_status_seq', 1, false);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 226
-- Name: posts_id_post_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.posts_id_post_seq', 1, false);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 228
-- Name: rental_agreements_id_rental_agreement_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.rental_agreements_id_rental_agreement_seq', 1, false);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 230
-- Name: reports_id_report_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reports_id_report_seq', 1, false);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 244
-- Name: reports_types_id_reports_types_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reports_types_id_reports_types_seq', 2, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 248
-- Name: room_status_id_room_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.room_status_id_room_status_seq', 1, false);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 232
-- Name: rooms_id_room_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.rooms_id_room_seq', 1, false);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 236
-- Name: statuses_id_statuses_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_id_statuses_seq', 1, false);


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 240
-- Name: statuses_workers_id_status_worker_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_workers_id_status_worker_seq', 1, false);


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 242
-- Name: statuses_workspaces_id_status_workspace_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_workspaces_id_status_workspace_seq', 1, false);


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.users_id_user_seq', 1, true);


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 238
-- Name: workers_id_worker_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workers_id_worker_seq', 1, false);


--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 251
-- Name: workers_statuses_types_id_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workers_statuses_types_id_status_seq', 1, false);


--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 234
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workspaces_id_workspace_seq', 1, false);


--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 253
-- Name: workspaces_reservations _stat_id_workspaces_reservations _s_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management."workspaces_reservations _stat_id_workspaces_reservations _s_seq"', 1, false);


--
-- TOC entry 4872 (class 2606 OID 16806)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id_department);


--
-- TOC entry 4880 (class 2606 OID 16831)
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id_floor);


--
-- TOC entry 4874 (class 2606 OID 17067)
-- Name: offices offices_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (id_office);


--
-- TOC entry 4904 (class 2606 OID 17044)
-- Name: offices_status offices_status_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices_status
    ADD CONSTRAINT offices_status_pk PRIMARY KEY (id_office_status);


--
-- TOC entry 4906 (class 2606 OID 17046)
-- Name: offices_status offices_status_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices_status
    ADD CONSTRAINT offices_status_unique UNIQUE (name);


--
-- TOC entry 4882 (class 2606 OID 16845)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id_post);


--
-- TOC entry 4884 (class 2606 OID 16852)
-- Name: rental_agreements rental_agreements_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_pkey PRIMARY KEY (id_rental_agreement);


--
-- TOC entry 4886 (class 2606 OID 16869)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id_report);


--
-- TOC entry 4900 (class 2606 OID 17009)
-- Name: reports_types reports_types_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports_types
    ADD CONSTRAINT reports_types_pk PRIMARY KEY (id_reports_types);


--
-- TOC entry 4902 (class 2606 OID 17345)
-- Name: reports_types reports_types_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports_types
    ADD CONSTRAINT reports_types_unique UNIQUE (name);


--
-- TOC entry 4908 (class 2606 OID 17101)
-- Name: room_status room_status_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.room_status
    ADD CONSTRAINT room_status_pk PRIMARY KEY (id_room_status);


--
-- TOC entry 4910 (class 2606 OID 17103)
-- Name: room_status room_status_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.room_status
    ADD CONSTRAINT room_status_unique UNIQUE (name);


--
-- TOC entry 4888 (class 2606 OID 16882)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id_room);


--
-- TOC entry 4892 (class 2606 OID 16925)
-- Name: workspace_statuses_types statuses_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_statuses_types
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id_workspace_status_type);


--
-- TOC entry 4896 (class 2606 OID 16939)
-- Name: statuses_workers statuses_workers_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_pkey PRIMARY KEY (id_status_worker);


--
-- TOC entry 4898 (class 2606 OID 16966)
-- Name: statuses_workspaces statuses_workspaces_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_pkey PRIMARY KEY (id_status_workspace);


--
-- TOC entry 4876 (class 2606 OID 16824)
-- Name: users users_login_key; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- TOC entry 4878 (class 2606 OID 16822)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- TOC entry 4894 (class 2606 OID 16932)
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id_worker);


--
-- TOC entry 4912 (class 2606 OID 17317)
-- Name: workers_statuses_types workers_statuses_types_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers_statuses_types
    ADD CONSTRAINT workers_statuses_types_pk PRIMARY KEY (id_status);


--
-- TOC entry 4914 (class 2606 OID 17319)
-- Name: workers_statuses_types workers_statuses_types_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers_statuses_types
    ADD CONSTRAINT workers_statuses_types_unique UNIQUE (name);


--
-- TOC entry 4890 (class 2606 OID 16894)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id_workspace);


--
-- TOC entry 4916 (class 2606 OID 17351)
-- Name: workspace_reservations_statuses workspaces_reservations__statuses_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_reservations_statuses
    ADD CONSTRAINT workspaces_reservations__statuses_pk PRIMARY KEY (id_workspace_reservations_statuses);


--
-- TOC entry 4937 (class 2620 OID 25655)
-- Name: workers trg_delete_worker; Type: TRIGGER; Schema: offices_management; Owner: postgres
--

CREATE TRIGGER trg_delete_worker AFTER DELETE ON offices_management.workers FOR EACH ROW EXECUTE FUNCTION public.update_workspace_statuses();


--
-- TOC entry 4939 (class 2620 OID 25644)
-- Name: statuses_workspaces trg_update_free_workspaces; Type: TRIGGER; Schema: offices_management; Owner: postgres
--

CREATE TRIGGER trg_update_free_workspaces AFTER INSERT OR DELETE OR UPDATE ON offices_management.statuses_workspaces FOR EACH ROW EXECUTE FUNCTION offices_management.update_free_workspaces();


--
-- TOC entry 4938 (class 2620 OID 25654)
-- Name: workers trg_update_worker; Type: TRIGGER; Schema: offices_management; Owner: postgres
--

CREATE TRIGGER trg_update_worker AFTER UPDATE OF is_deleted ON offices_management.workers FOR EACH ROW WHEN ((old.is_deleted IS DISTINCT FROM new.is_deleted)) EXECUTE FUNCTION public.update_workspace_statuses();


--
-- TOC entry 4936 (class 2620 OID 25634)
-- Name: workspaces trg_update_workspaces_count; Type: TRIGGER; Schema: offices_management; Owner: postgres
--

CREATE TRIGGER trg_update_workspaces_count AFTER INSERT OR DELETE OR UPDATE ON offices_management.workspaces FOR EACH ROW EXECUTE FUNCTION offices_management.update_workspaces_count();


--
-- TOC entry 4918 (class 2606 OID 17068)
-- Name: floors floors_id_office_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors
    ADD CONSTRAINT floors_id_office_fkey FOREIGN KEY (id_office) REFERENCES offices_management.offices(id_office);


--
-- TOC entry 4917 (class 2606 OID 17047)
-- Name: offices offices_offices_status_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices
    ADD CONSTRAINT offices_offices_status_fk FOREIGN KEY (id_office_status) REFERENCES offices_management.offices_status(id_office_status);


--
-- TOC entry 4919 (class 2606 OID 17073)
-- Name: rental_agreements rental_agreements_id_office_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_id_office_fkey FOREIGN KEY (id_office) REFERENCES offices_management.offices(id_office);


--
-- TOC entry 4920 (class 2606 OID 16858)
-- Name: rental_agreements rental_agreements_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4921 (class 2606 OID 16870)
-- Name: reports reports_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4922 (class 2606 OID 17012)
-- Name: reports reports_reports_types_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_reports_types_fk FOREIGN KEY (id_reports_types) REFERENCES offices_management.reports_types(id_reports_types);


--
-- TOC entry 4923 (class 2606 OID 16883)
-- Name: rooms rooms_id_floor_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_id_floor_fkey FOREIGN KEY (id_floor) REFERENCES offices_management.floors(id_floor);


--
-- TOC entry 4924 (class 2606 OID 17104)
-- Name: rooms rooms_room_status_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_room_status_fk FOREIGN KEY (id_room_status) REFERENCES offices_management.room_status(id_room_status);


--
-- TOC entry 4926 (class 2606 OID 16945)
-- Name: statuses_workers statuses_workers_departments_id_department_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_departments_id_department_fkey FOREIGN KEY (id_department) REFERENCES offices_management.departments(id_department);


--
-- TOC entry 4927 (class 2606 OID 16955)
-- Name: statuses_workers statuses_workers_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4928 (class 2606 OID 16950)
-- Name: statuses_workers statuses_workers_id_worker_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_id_worker_fkey FOREIGN KEY (id_worker) REFERENCES offices_management.workers(id_worker);


--
-- TOC entry 4929 (class 2606 OID 16940)
-- Name: statuses_workers statuses_workers_posts_id_post_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_posts_id_post_fkey FOREIGN KEY (id_post) REFERENCES offices_management.posts(id_post);


--
-- TOC entry 4930 (class 2606 OID 17320)
-- Name: statuses_workers statuses_workers_workers_statuses_types_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_workers_statuses_types_fk FOREIGN KEY (id_status) REFERENCES offices_management.workers_statuses_types(id_status);


--
-- TOC entry 4931 (class 2606 OID 16967)
-- Name: statuses_workspaces statuses_workspaces_id_statuses_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_statuses_fkey FOREIGN KEY (id_workspace_status_type) REFERENCES offices_management.workspace_statuses_types(id_workspace_status_type);


--
-- TOC entry 4932 (class 2606 OID 16982)
-- Name: statuses_workspaces statuses_workspaces_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4933 (class 2606 OID 16972)
-- Name: statuses_workspaces statuses_workspaces_id_worker_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_worker_fkey FOREIGN KEY (id_worker) REFERENCES offices_management.workers(id_worker);


--
-- TOC entry 4934 (class 2606 OID 16977)
-- Name: statuses_workspaces statuses_workspaces_id_workspace_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_workspace_fkey FOREIGN KEY (id_workspace) REFERENCES offices_management.workspaces(id_workspace);


--
-- TOC entry 4935 (class 2606 OID 17403)
-- Name: statuses_workspaces statuses_workspaces_workspace_reservations_statuses_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_workspace_reservations_statuses_fk FOREIGN KEY (id_workspace_reservations_statuses) REFERENCES offices_management.workspace_reservations_statuses(id_workspace_reservations_statuses);


--
-- TOC entry 4925 (class 2606 OID 16895)
-- Name: workspaces workspaces_id_room_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces
    ADD CONSTRAINT workspaces_id_room_fkey FOREIGN KEY (id_room) REFERENCES offices_management.rooms(id_room);


-- Completed on 2025-03-11 08:47:01

--
-- PostgreSQL database dump complete
--

