--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-02-17 16:38:41

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
-- TOC entry 269 (class 1255 OID 17128)
-- Name: search_offices(text); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.search_offices(p_search_string text) RETURNS TABLE(id_office integer, office_name character varying, address character varying, id_office_status integer, square integer, image character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT o.id_office, o.office_name, o.address, o.id_office_status, o.square, o.image
    FROM offices_management.offices o
    WHERE o.office_name ILIKE '%' || p_search_string || '%'
       OR o.address ILIKE '%' || p_search_string || '%';
END;
$$;


ALTER FUNCTION offices_management.search_offices(p_search_string text) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 17129)
-- Name: search_rooms(text); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.search_rooms(p_search_string text) RETURNS TABLE(id_room integer, id_room_status integer, name character varying, total_workspace integer, id_floor integer, square integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT r.id_room, r.id_room_status, r.name, r.total_workspace, r.id_floor, r.square
    FROM offices_management.rooms r
    WHERE r.name ILIKE '%' || p_search_string || '%';
END;
$$;


ALTER FUNCTION offices_management.search_rooms(p_search_string text) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 17130)
-- Name: search_workers(text); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.search_workers(p_search_string text) RETURNS TABLE(id_worker integer, name character varying, surname character varying, patronymic character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT w.id_worker, w."name", w.surname, w.patronymic
    FROM offices_management.workers w
    WHERE w."name" ILIKE '%' || p_search_string || '%'
       OR w.surname ILIKE '%' || p_search_string || '%'
       OR w.patronymic ILIKE '%' || p_search_string || '%';
END;
$$;


ALTER FUNCTION offices_management.search_workers(p_search_string text) OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 17132)
-- Name: search_workers_by_department(text); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.search_workers_by_department(p_department_name text) RETURNS TABLE(id_worker integer, name character varying, surname character varying, patronymic character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT w.id_worker, w."name", w.surname, w.patronymic
    FROM offices_management.workers w
    JOIN offices_management.statuses_workers sw ON w.id_worker = sw.id_worker
    JOIN offices_management.departments d ON sw.id_department = d.id_department
    WHERE d."name" ILIKE '%' || p_department_name || '%';
END;
$$;


ALTER FUNCTION offices_management.search_workers_by_department(p_department_name text) OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 17131)
-- Name: search_workers_by_post(text); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.search_workers_by_post(p_post_name text) RETURNS TABLE(id_worker integer, name character varying, surname character varying, patronymic character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT w.id_worker, w."name", w.surname, w.patronymic
    FROM offices_management.workers w
    JOIN offices_management.statuses_workers sw ON w.id_worker = sw.id_worker
    JOIN offices_management.posts p ON sw.id_post = p.id_post
    WHERE p."name" ILIKE '%' || p_post_name || '%';
END;
$$;


ALTER FUNCTION offices_management.search_workers_by_post(p_post_name text) OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 17133)
-- Name: search_workspaces_by_name(text); Type: FUNCTION; Schema: offices_management; Owner: postgres
--

CREATE FUNCTION offices_management.search_workspaces_by_name(p_workspace_name text) RETURNS TABLE(id_workspace integer, workspace_name character varying, id_room integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT ws.id_workspace, ws."name" AS workspace_name, ws.id_room
    FROM offices_management.workspaces ws
    WHERE ws."name" ILIKE '%' || p_workspace_name || '%';
END;
$$;


ALTER FUNCTION offices_management.search_workspaces_by_name(p_workspace_name text) OWNER TO postgres;

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
-- TOC entry 255 (class 1259 OID 17347)
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
-- TOC entry 256 (class 1259 OID 17393)
-- Name: current_workspaces; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.current_workspaces AS
 SELECT w.id_workspace,
    w.id_room,
    w.name AS workspace_name,
    wo.id_worker,
    concat_ws(' '::text, wo.name, wo.surname, wo.patronymic) AS full_worker_name,
    s.id_status_workspace,
    s.id_workspace_status_type,
    st.name AS workspace_status_type_name,
    s.id_workspace_reservations_statuses,
    wrs.name AS reservation_statuse_name,
    s.start_date,
    s.end_date
   FROM ((((offices_management.workspaces w
     JOIN offices_management.statuses_workspaces s ON ((w.id_workspace = s.id_workspace)))
     LEFT JOIN offices_management.workspace_reservations_statuses wrs ON ((s.id_workspace_reservations_statuses = wrs.id_workspace_reservations_statuses)))
     LEFT JOIN offices_management.workers wo ON ((s.id_worker = wo.id_worker)))
     LEFT JOIN offices_management.workspace_statuses_types st ON ((s.id_workspace_status_type = st.id_workspace_status_type)))
  WHERE (((s.end_date IS NULL) OR (s.end_date > CURRENT_DATE)) AND (s.start_date < CURRENT_DATE) AND (w.is_deleted <> true));


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
-- TOC entry 5119 (class 0 OID 0)
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
    total_workspace integer NOT NULL,
    id_office integer NOT NULL,
    square integer,
    free_workspaces integer,
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
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 224
-- Name: floors_id_floor_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.floors_id_floor_seq OWNED BY offices_management.floors.id_floor;


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
-- TOC entry 257 (class 1259 OID 17398)
-- Name: history_workspace_statuses; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.history_workspace_statuses AS
 SELECT sw.id_workspace,
    sw.id_status_workspace,
    sw.start_date,
    sw.end_date,
    sw.id_workspace_status_type,
    wst.name AS workspace_status_type_name,
    sw.id_workspace_reservations_statuses,
    wrs.name AS workspace_reservation_statuse_name,
    concat(wo.name, ' ', wo.surname, ' ', COALESCE(wo.patronymic, ''::character varying)) AS worker_full_name,
    u.name AS user_name
   FROM ((((offices_management.statuses_workspaces sw
     LEFT JOIN offices_management.workspace_reservations_statuses wrs ON ((sw.id_workspace_reservations_statuses = wrs.id_workspace_reservations_statuses)))
     LEFT JOIN offices_management.workspace_statuses_types wst ON ((sw.id_workspace_status_type = wst.id_workspace_status_type)))
     LEFT JOIN offices_management.workers wo ON ((sw.id_worker = wo.id_worker)))
     LEFT JOIN offices_management.users u ON ((sw.id_user = u.id_user)));


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
    total_workspace integer,
    city character varying(30) NOT NULL,
    free_workspaces integer
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
-- TOC entry 5121 (class 0 OID 0)
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
-- TOC entry 5122 (class 0 OID 0)
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
-- TOC entry 5123 (class 0 OID 0)
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
-- TOC entry 5124 (class 0 OID 0)
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
    total_workspace integer NOT NULL,
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
-- TOC entry 5125 (class 0 OID 0)
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
-- TOC entry 5126 (class 0 OID 0)
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
-- TOC entry 5127 (class 0 OID 0)
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
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 242
-- Name: statuses_workspaces_id_status_workspace_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.statuses_workspaces_id_status_workspace_seq OWNED BY offices_management.statuses_workspaces.id_status_workspace;


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
-- TOC entry 5129 (class 0 OID 0)
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
-- TOC entry 253 (class 1259 OID 17328)
-- Name: worker_details; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.worker_details AS
 WITH latest_status AS (
         SELECT sw.id_worker,
            sw.id_post,
            sw.id_department,
            sw.start_date,
            sw.end_date,
            sw.id_status
           FROM offices_management.statuses_workers sw
          WHERE (((sw.end_date IS NULL) OR (sw.end_date > CURRENT_DATE)) AND (sw.start_date < CURRENT_DATE))
        )
 SELECT w.id_worker,
    (((((w.surname)::text || ' '::text) || (w.name)::text) || ' '::text) || (COALESCE(w.patronymic, ''::character varying))::text) AS full_worker_name,
    p.id_post,
    p.name AS post_name,
    d.id_department,
    d.name AS department_name,
    wst.id_status,
    wst.name AS status_name
   FROM ((((offices_management.workers w
     JOIN latest_status ls ON ((w.id_worker = ls.id_worker)))
     LEFT JOIN offices_management.workers_statuses_types wst ON ((ls.id_status = wst.id_status)))
     JOIN offices_management.posts p ON ((ls.id_post = p.id_post)))
     JOIN offices_management.departments d ON ((ls.id_department = d.id_department)));


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
-- TOC entry 5130 (class 0 OID 0)
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
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 234
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.workspaces_id_workspace_seq OWNED BY offices_management.workspaces.id_workspace;


--
-- TOC entry 254 (class 1259 OID 17346)
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
-- TOC entry 4849 (class 2604 OID 16802)
-- Name: departments id_department; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.departments ALTER COLUMN id_department SET DEFAULT nextval('offices_management.departments_id_department_seq'::regclass);


--
-- TOC entry 4853 (class 2604 OID 16829)
-- Name: floors id_floor; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors ALTER COLUMN id_floor SET DEFAULT nextval('offices_management.floors_id_floor_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 17065)
-- Name: offices id_office; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices ALTER COLUMN id_office SET DEFAULT nextval('offices_management.offices_id_office_seq'::regclass);


--
-- TOC entry 4854 (class 2604 OID 16841)
-- Name: posts id_post; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.posts ALTER COLUMN id_post SET DEFAULT nextval('offices_management.posts_id_post_seq'::regclass);


--
-- TOC entry 4855 (class 2604 OID 16850)
-- Name: rental_agreements id_rental_agreement; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements ALTER COLUMN id_rental_agreement SET DEFAULT nextval('offices_management.rental_agreements_id_rental_agreement_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 16867)
-- Name: reports id_report; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports ALTER COLUMN id_report SET DEFAULT nextval('offices_management.reports_id_report_seq'::regclass);


--
-- TOC entry 4857 (class 2604 OID 16879)
-- Name: rooms id_room; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms ALTER COLUMN id_room SET DEFAULT nextval('offices_management.rooms_id_room_seq'::regclass);


--
-- TOC entry 4863 (class 2604 OID 16937)
-- Name: statuses_workers id_status_worker; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers ALTER COLUMN id_status_worker SET DEFAULT nextval('offices_management.statuses_workers_id_status_worker_seq'::regclass);


--
-- TOC entry 4864 (class 2604 OID 16964)
-- Name: statuses_workspaces id_status_workspace; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces ALTER COLUMN id_status_workspace SET DEFAULT nextval('offices_management.statuses_workspaces_id_status_workspace_seq'::regclass);


--
-- TOC entry 4851 (class 2604 OID 16819)
-- Name: users id_user; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users ALTER COLUMN id_user SET DEFAULT nextval('offices_management.users_id_user_seq'::regclass);


--
-- TOC entry 4861 (class 2604 OID 16930)
-- Name: workers id_worker; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers ALTER COLUMN id_worker SET DEFAULT nextval('offices_management.workers_id_worker_seq'::regclass);


--
-- TOC entry 4860 (class 2604 OID 16921)
-- Name: workspace_statuses_types id_workspace_status_type; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_statuses_types ALTER COLUMN id_workspace_status_type SET DEFAULT nextval('offices_management.statuses_id_statuses_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 16892)
-- Name: workspaces id_workspace; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces ALTER COLUMN id_workspace SET DEFAULT nextval('offices_management.workspaces_id_workspace_seq'::regclass);


--
-- TOC entry 5079 (class 0 OID 16799)
-- Dependencies: 219
-- Data for Name: departments; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.departments VALUES (1, 'Отдел продаж', 'Отдел, занимающийся продажами');
INSERT INTO offices_management.departments VALUES (2, 'Отдел маркетинга', 'Отдел, занимающийся маркетингом');
INSERT INTO offices_management.departments VALUES (3, 'Отдел разработки', 'Отдел, занимающийся разработкой продуктов');


--
-- TOC entry 5085 (class 0 OID 16826)
-- Dependencies: 225
-- Data for Name: floors; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.floors VALUES (1, 1, 25, 1, 250, 10, '1floor.svg');
INSERT INTO offices_management.floors VALUES (2, 2, 25, 1, 250, 10, '2floor.svg');
INSERT INTO offices_management.floors VALUES (3, 1, 30, 2, 300, 15, '1floor.svg');
INSERT INTO offices_management.floors VALUES (4, 2, 30, 2, 300, 15, '2floor.svg');


--
-- TOC entry 5081 (class 0 OID 16808)
-- Dependencies: 221
-- Data for Name: offices; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.offices VALUES (1, 'Офис 1', 'Улица Ленина, 1', 1, 500, 'office1.jpg', 25, 'Москва', 10);
INSERT INTO offices_management.offices VALUES (2, 'Офис 2', 'Улица Пушкина, 2', 1, 600, 'office2.jpeg', 30, 'Москва', 15);


--
-- TOC entry 5107 (class 0 OID 17040)
-- Dependencies: 247
-- Data for Name: offices_status; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.offices_status OVERRIDING SYSTEM VALUE VALUES (1, 'Активный');
INSERT INTO offices_management.offices_status OVERRIDING SYSTEM VALUE VALUES (2, 'Неактивный');


--
-- TOC entry 5087 (class 0 OID 16838)
-- Dependencies: 227
-- Data for Name: posts; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.posts VALUES (1, 'Менеджер по продажам', 'Ответственный за продажи');
INSERT INTO offices_management.posts VALUES (2, 'Маркетолог', 'Ответственный за маркетинг');
INSERT INTO offices_management.posts VALUES (3, 'Разработчик', 'Ответственный за разработку программного обеспечения');


--
-- TOC entry 5089 (class 0 OID 16847)
-- Dependencies: 229
-- Data for Name: rental_agreements; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.rental_agreements VALUES (1, '2023-01-01', '2023-12-31', 100000, 'договор_1.pdf', 1, 1);
INSERT INTO offices_management.rental_agreements VALUES (2, '2023-01-01', '2023-12-31', 120000, 'договор_2.pdf', 2, 1);


--
-- TOC entry 5091 (class 0 OID 16864)
-- Dependencies: 231
-- Data for Name: reports; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5105 (class 0 OID 17005)
-- Dependencies: 245
-- Data for Name: reports_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.reports_types OVERRIDING SYSTEM VALUE VALUES (1, 'Финансовый по офису');
INSERT INTO offices_management.reports_types OVERRIDING SYSTEM VALUE VALUES (2, 'Отчёт по Работникам');


--
-- TOC entry 5109 (class 0 OID 17097)
-- Dependencies: 249
-- Data for Name: room_status; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.room_status OVERRIDING SYSTEM VALUE VALUES (1, 'Гостевой', 'Доступно бронирование рабочих мест');
INSERT INTO offices_management.room_status OVERRIDING SYSTEM VALUE VALUES (2, 'Основной', 'Кабинет для долгосрочных сатрудников');
INSERT INTO offices_management.room_status OVERRIDING SYSTEM VALUE VALUES (3, 'На ремонте', 'Кабинет на ремонте');


--
-- TOC entry 5093 (class 0 OID 16876)
-- Dependencies: 233
-- Data for Name: rooms; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.rooms VALUES (1, 'Кабинет 101', 5, 1, 50, 1);
INSERT INTO offices_management.rooms VALUES (2, 'Кабинет 102', 5, 1, 50, 1);
INSERT INTO offices_management.rooms VALUES (3, 'Кабинет 103', 5, 1, 50, 1);
INSERT INTO offices_management.rooms VALUES (4, 'Кабинет 104', 5, 1, 50, 1);
INSERT INTO offices_management.rooms VALUES (5, 'Кабинет 105', 5, 1, 50, 1);
INSERT INTO offices_management.rooms VALUES (6, 'Кабинет 201', 5, 2, 50, 1);
INSERT INTO offices_management.rooms VALUES (7, 'Кабинет 202', 5, 2, 50, 1);
INSERT INTO offices_management.rooms VALUES (8, 'Кабинет 203', 5, 2, 50, 1);
INSERT INTO offices_management.rooms VALUES (9, 'Кабинет 204', 5, 2, 50, 1);
INSERT INTO offices_management.rooms VALUES (10, 'Кабинет 205', 5, 2, 50, 1);
INSERT INTO offices_management.rooms VALUES (11, 'Кабинет 301', 6, 1, 60, 1);
INSERT INTO offices_management.rooms VALUES (12, 'Кабинет 302', 6, 1, 60, 1);
INSERT INTO offices_management.rooms VALUES (13, 'Кабинет 303', 6, 1, 60, 1);
INSERT INTO offices_management.rooms VALUES (14, 'Кабинет 304', 6, 1, 60, 1);
INSERT INTO offices_management.rooms VALUES (15, 'Кабинет 305', 6, 1, 60, 1);
INSERT INTO offices_management.rooms VALUES (16, 'Кабинет 401', 6, 2, 60, 1);
INSERT INTO offices_management.rooms VALUES (17, 'Кабинет 402', 6, 2, 60, 1);
INSERT INTO offices_management.rooms VALUES (18, 'Кабинет 403', 6, 2, 60, 1);
INSERT INTO offices_management.rooms VALUES (19, 'Кабинет 404', 6, 2, 60, 1);
INSERT INTO offices_management.rooms VALUES (20, 'Кабинет 405', 6, 2, 60, 1);


--
-- TOC entry 5101 (class 0 OID 16934)
-- Dependencies: 241
-- Data for Name: statuses_workers; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.statuses_workers VALUES (1, '2023-01-01', NULL, 1, 1, 1, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (2, '2023-01-01', NULL, 2, 2, 2, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (3, '2023-01-01', NULL, 3, 3, 3, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (4, '2023-01-01', NULL, 1, 1, 4, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (5, '2023-01-01', NULL, 2, 2, 5, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (6, '2023-01-01', NULL, 3, 3, 6, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (7, '2023-01-01', NULL, 1, 1, 7, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (8, '2023-01-01', NULL, 2, 2, 8, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (9, '2023-01-01', NULL, 3, 3, 9, 1, 1);
INSERT INTO offices_management.statuses_workers VALUES (10, '2023-01-01', NULL, 1, 1, 10, 1, 1);


--
-- TOC entry 5103 (class 0 OID 16961)
-- Dependencies: 243
-- Data for Name: statuses_workspaces; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.statuses_workspaces VALUES (1, '2023-01-01', NULL, 1, NULL, 1, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (2, '2023-01-01', NULL, 2, NULL, 2, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (3, '2023-01-01', NULL, 3, NULL, 3, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (4, '2023-01-01', NULL, 4, NULL, 4, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (5, '2023-01-01', NULL, 5, NULL, 5, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (6, '2023-01-01', NULL, 6, NULL, 6, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (7, '2023-01-01', NULL, 7, NULL, 7, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (8, '2023-01-01', NULL, 8, NULL, 8, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (9, '2023-01-01', NULL, 9, NULL, 9, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (10, '2023-01-01', NULL, 10, NULL, 10, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (11, '2023-01-01', NULL, 11, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (12, '2023-01-01', NULL, 12, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (13, '2023-01-01', NULL, 13, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (14, '2023-01-01', NULL, 14, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (15, '2023-01-01', NULL, 15, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (16, '2023-01-01', NULL, 16, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (17, '2023-01-01', NULL, 17, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (18, '2023-01-01', NULL, 18, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (19, '2023-01-01', NULL, 19, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (20, '2023-01-01', NULL, 20, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (21, '2023-01-01', NULL, 21, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (22, '2023-01-01', NULL, 22, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (23, '2023-01-01', NULL, 23, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (24, '2023-01-01', NULL, 24, NULL, NULL, 1, NULL);
INSERT INTO offices_management.statuses_workspaces VALUES (25, '2023-01-01', NULL, 25, NULL, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (26, '2023-01-01', NULL, 26, NULL, NULL, 1, 3);
INSERT INTO offices_management.statuses_workspaces VALUES (27, '2023-01-01', NULL, 27, NULL, NULL, 1, 2);
INSERT INTO offices_management.statuses_workspaces VALUES (28, '2023-01-01', NULL, 28, NULL, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (29, '2023-01-01', NULL, 29, NULL, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (30, '2023-01-01', NULL, 30, NULL, NULL, 1, 1);


--
-- TOC entry 5083 (class 0 OID 16816)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.users VALUES (1, 'admin', '\x61646d696e5f70617373776f7264', 'Александр', 'Сидоров', 'Сидорович', true, NULL);


--
-- TOC entry 5099 (class 0 OID 16927)
-- Dependencies: 239
-- Data for Name: workers; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workers VALUES (1, 'Иван', 'Иванов', 'Иванович', false);
INSERT INTO offices_management.workers VALUES (2, 'Петр', 'Петров', 'Петрович', false);
INSERT INTO offices_management.workers VALUES (3, 'Сергей', 'Сергеев', 'Сергеевич', false);
INSERT INTO offices_management.workers VALUES (4, 'Алексей', 'Алексеев', 'Алексеевич', false);
INSERT INTO offices_management.workers VALUES (5, 'Дмитрий', 'Дмитриев', 'Дмитриевич', false);
INSERT INTO offices_management.workers VALUES (6, 'Анна', 'Антонова', 'Антоновна', false);
INSERT INTO offices_management.workers VALUES (7, 'Мария', 'Маркова', 'Марковна', false);
INSERT INTO offices_management.workers VALUES (8, 'Елена', 'Еленина', 'Еленовна', false);
INSERT INTO offices_management.workers VALUES (9, 'Ольга', 'Ольгина', 'Ольгина', false);
INSERT INTO offices_management.workers VALUES (10, 'Татьяна', 'Татьянова', 'Татьяновна', false);


--
-- TOC entry 5111 (class 0 OID 17311)
-- Dependencies: 252
-- Data for Name: workers_statuses_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workers_statuses_types OVERRIDING SYSTEM VALUE VALUES (1, 'Активный', 'Работник активно работает');
INSERT INTO offices_management.workers_statuses_types OVERRIDING SYSTEM VALUE VALUES (2, 'В отпуске', 'Работник в отпуске');
INSERT INTO offices_management.workers_statuses_types OVERRIDING SYSTEM VALUE VALUES (3, 'Командирока', 'Работник находится в командировке');


--
-- TOC entry 5113 (class 0 OID 17347)
-- Dependencies: 255
-- Data for Name: workspace_reservations_statuses; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workspace_reservations_statuses OVERRIDING SYSTEM VALUE VALUES (1, 'Подвыерждено', NULL);
INSERT INTO offices_management.workspace_reservations_statuses OVERRIDING SYSTEM VALUE VALUES (2, 'Ожидание', NULL);
INSERT INTO offices_management.workspace_reservations_statuses OVERRIDING SYSTEM VALUE VALUES (3, 'Прервано', NULL);


--
-- TOC entry 5097 (class 0 OID 16918)
-- Dependencies: 237
-- Data for Name: workspace_statuses_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workspace_statuses_types VALUES (1, 'Доступно', 'Рабочее место доступно для бронирования');
INSERT INTO offices_management.workspace_statuses_types VALUES (2, 'Свободно', 'Рабочее место свободно');
INSERT INTO offices_management.workspace_statuses_types VALUES (3, 'Ремонт', 'Рабочее место на ремонте');


--
-- TOC entry 5095 (class 0 OID 16889)
-- Dependencies: 235
-- Data for Name: workspaces; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workspaces VALUES (1, 'Рабочее место 1', 1, false);
INSERT INTO offices_management.workspaces VALUES (2, 'Рабочее место 2', 1, false);
INSERT INTO offices_management.workspaces VALUES (3, 'Рабочее место 3', 1, false);
INSERT INTO offices_management.workspaces VALUES (4, 'Рабочее место 4', 2, false);
INSERT INTO offices_management.workspaces VALUES (5, 'Рабочее место 5', 2, false);
INSERT INTO offices_management.workspaces VALUES (6, 'Рабочее место 6', 2, false);
INSERT INTO offices_management.workspaces VALUES (7, 'Рабочее место 7', 3, false);
INSERT INTO offices_management.workspaces VALUES (8, 'Рабочее место 8', 3, false);
INSERT INTO offices_management.workspaces VALUES (9, 'Рабочее место 9', 3, false);
INSERT INTO offices_management.workspaces VALUES (10, 'Рабочее место 10', 4, false);
INSERT INTO offices_management.workspaces VALUES (11, 'Рабочее место 11', 4, false);
INSERT INTO offices_management.workspaces VALUES (12, 'Рабочее место 12', 4, false);
INSERT INTO offices_management.workspaces VALUES (13, 'Рабочее место 13', 5, false);
INSERT INTO offices_management.workspaces VALUES (14, 'Рабочее место 14', 5, false);
INSERT INTO offices_management.workspaces VALUES (15, 'Рабочее место 15', 5, false);
INSERT INTO offices_management.workspaces VALUES (16, 'Рабочее место 16', 6, false);
INSERT INTO offices_management.workspaces VALUES (17, 'Рабочее место 17', 6, false);
INSERT INTO offices_management.workspaces VALUES (18, 'Рабочее место 18', 6, false);
INSERT INTO offices_management.workspaces VALUES (19, 'Рабочее место 19', 7, false);
INSERT INTO offices_management.workspaces VALUES (20, 'Рабочее место 20', 7, false);
INSERT INTO offices_management.workspaces VALUES (21, 'Рабочее место 21', 7, false);
INSERT INTO offices_management.workspaces VALUES (22, 'Рабочее место 22', 8, false);
INSERT INTO offices_management.workspaces VALUES (23, 'Рабочее место 23', 8, false);
INSERT INTO offices_management.workspaces VALUES (24, 'Рабочее место 24', 8, false);
INSERT INTO offices_management.workspaces VALUES (25, 'Рабочее место 25', 9, false);
INSERT INTO offices_management.workspaces VALUES (26, 'Рабочее место 26', 9, false);
INSERT INTO offices_management.workspaces VALUES (27, 'Рабочее место 27', 9, false);
INSERT INTO offices_management.workspaces VALUES (28, 'Рабочее место 28', 10, false);
INSERT INTO offices_management.workspaces VALUES (29, 'Рабочее место 29', 10, false);
INSERT INTO offices_management.workspaces VALUES (30, 'Рабочее место 30', 10, false);


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 218
-- Name: departments_id_department_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.departments_id_department_seq', 3, true);


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 224
-- Name: floors_id_floor_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.floors_id_floor_seq', 4, true);


--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 220
-- Name: offices_id_office_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.offices_id_office_seq', 2, true);


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 246
-- Name: offices_status_id_office_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.offices_status_id_office_status_seq', 2, true);


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 226
-- Name: posts_id_post_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.posts_id_post_seq', 3, true);


--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 228
-- Name: rental_agreements_id_rental_agreement_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.rental_agreements_id_rental_agreement_seq', 2, true);


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 230
-- Name: reports_id_report_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reports_id_report_seq', 2, true);


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 244
-- Name: reports_types_id_reports_types_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reports_types_id_reports_types_seq', 2, true);


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 248
-- Name: room_status_id_room_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.room_status_id_room_status_seq', 3, true);


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 232
-- Name: rooms_id_room_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.rooms_id_room_seq', 20, true);


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 236
-- Name: statuses_id_statuses_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_id_statuses_seq', 3, true);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 240
-- Name: statuses_workers_id_status_worker_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_workers_id_status_worker_seq', 10, true);


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 242
-- Name: statuses_workspaces_id_status_workspace_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_workspaces_id_status_workspace_seq', 30, true);


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.users_id_user_seq', 1, true);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 238
-- Name: workers_id_worker_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workers_id_worker_seq', 10, true);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 251
-- Name: workers_statuses_types_id_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workers_statuses_types_id_status_seq', 3, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 234
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workspaces_id_workspace_seq', 30, true);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 254
-- Name: workspaces_reservations _stat_id_workspaces_reservations _s_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management."workspaces_reservations _stat_id_workspaces_reservations _s_seq"', 3, true);


--
-- TOC entry 4866 (class 2606 OID 16806)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id_department);


--
-- TOC entry 4874 (class 2606 OID 16831)
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id_floor);


--
-- TOC entry 4868 (class 2606 OID 17067)
-- Name: offices offices_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (id_office);


--
-- TOC entry 4898 (class 2606 OID 17044)
-- Name: offices_status offices_status_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices_status
    ADD CONSTRAINT offices_status_pk PRIMARY KEY (id_office_status);


--
-- TOC entry 4900 (class 2606 OID 17046)
-- Name: offices_status offices_status_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices_status
    ADD CONSTRAINT offices_status_unique UNIQUE (name);


--
-- TOC entry 4876 (class 2606 OID 16845)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id_post);


--
-- TOC entry 4878 (class 2606 OID 16852)
-- Name: rental_agreements rental_agreements_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_pkey PRIMARY KEY (id_rental_agreement);


--
-- TOC entry 4880 (class 2606 OID 16869)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id_report);


--
-- TOC entry 4894 (class 2606 OID 17009)
-- Name: reports_types reports_types_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports_types
    ADD CONSTRAINT reports_types_pk PRIMARY KEY (id_reports_types);


--
-- TOC entry 4896 (class 2606 OID 17345)
-- Name: reports_types reports_types_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports_types
    ADD CONSTRAINT reports_types_unique UNIQUE (name);


--
-- TOC entry 4902 (class 2606 OID 17101)
-- Name: room_status room_status_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.room_status
    ADD CONSTRAINT room_status_pk PRIMARY KEY (id_room_status);


--
-- TOC entry 4904 (class 2606 OID 17103)
-- Name: room_status room_status_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.room_status
    ADD CONSTRAINT room_status_unique UNIQUE (name);


--
-- TOC entry 4882 (class 2606 OID 16882)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id_room);


--
-- TOC entry 4886 (class 2606 OID 16925)
-- Name: workspace_statuses_types statuses_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_statuses_types
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id_workspace_status_type);


--
-- TOC entry 4890 (class 2606 OID 16939)
-- Name: statuses_workers statuses_workers_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_pkey PRIMARY KEY (id_status_worker);


--
-- TOC entry 4892 (class 2606 OID 16966)
-- Name: statuses_workspaces statuses_workspaces_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_pkey PRIMARY KEY (id_status_workspace);


--
-- TOC entry 4870 (class 2606 OID 16824)
-- Name: users users_login_key; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- TOC entry 4872 (class 2606 OID 16822)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- TOC entry 4888 (class 2606 OID 16932)
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id_worker);


--
-- TOC entry 4906 (class 2606 OID 17317)
-- Name: workers_statuses_types workers_statuses_types_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers_statuses_types
    ADD CONSTRAINT workers_statuses_types_pk PRIMARY KEY (id_status);


--
-- TOC entry 4908 (class 2606 OID 17319)
-- Name: workers_statuses_types workers_statuses_types_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers_statuses_types
    ADD CONSTRAINT workers_statuses_types_unique UNIQUE (name);


--
-- TOC entry 4884 (class 2606 OID 16894)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id_workspace);


--
-- TOC entry 4910 (class 2606 OID 17351)
-- Name: workspace_reservations_statuses workspaces_reservations__statuses_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_reservations_statuses
    ADD CONSTRAINT workspaces_reservations__statuses_pk PRIMARY KEY (id_workspace_reservations_statuses);


--
-- TOC entry 4912 (class 2606 OID 17068)
-- Name: floors floors_id_office_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors
    ADD CONSTRAINT floors_id_office_fkey FOREIGN KEY (id_office) REFERENCES offices_management.offices(id_office);


--
-- TOC entry 4911 (class 2606 OID 17047)
-- Name: offices offices_offices_status_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices
    ADD CONSTRAINT offices_offices_status_fk FOREIGN KEY (id_office_status) REFERENCES offices_management.offices_status(id_office_status);


--
-- TOC entry 4913 (class 2606 OID 17073)
-- Name: rental_agreements rental_agreements_id_office_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_id_office_fkey FOREIGN KEY (id_office) REFERENCES offices_management.offices(id_office);


--
-- TOC entry 4914 (class 2606 OID 16858)
-- Name: rental_agreements rental_agreements_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4915 (class 2606 OID 16870)
-- Name: reports reports_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4916 (class 2606 OID 17012)
-- Name: reports reports_reports_types_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_reports_types_fk FOREIGN KEY (id_reports_types) REFERENCES offices_management.reports_types(id_reports_types);


--
-- TOC entry 4917 (class 2606 OID 16883)
-- Name: rooms rooms_id_floor_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_id_floor_fkey FOREIGN KEY (id_floor) REFERENCES offices_management.floors(id_floor);


--
-- TOC entry 4918 (class 2606 OID 17104)
-- Name: rooms rooms_room_status_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_room_status_fk FOREIGN KEY (id_room_status) REFERENCES offices_management.room_status(id_room_status);


--
-- TOC entry 4920 (class 2606 OID 16945)
-- Name: statuses_workers statuses_workers_departments_id_department_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_departments_id_department_fkey FOREIGN KEY (id_department) REFERENCES offices_management.departments(id_department);


--
-- TOC entry 4921 (class 2606 OID 16955)
-- Name: statuses_workers statuses_workers_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4922 (class 2606 OID 16950)
-- Name: statuses_workers statuses_workers_id_worker_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_id_worker_fkey FOREIGN KEY (id_worker) REFERENCES offices_management.workers(id_worker);


--
-- TOC entry 4923 (class 2606 OID 16940)
-- Name: statuses_workers statuses_workers_posts_id_post_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_posts_id_post_fkey FOREIGN KEY (id_post) REFERENCES offices_management.posts(id_post);


--
-- TOC entry 4924 (class 2606 OID 17320)
-- Name: statuses_workers statuses_workers_workers_statuses_types_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_workers_statuses_types_fk FOREIGN KEY (id_status) REFERENCES offices_management.workers_statuses_types(id_status);


--
-- TOC entry 4925 (class 2606 OID 16967)
-- Name: statuses_workspaces statuses_workspaces_id_statuses_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_statuses_fkey FOREIGN KEY (id_workspace_status_type) REFERENCES offices_management.workspace_statuses_types(id_workspace_status_type);


--
-- TOC entry 4926 (class 2606 OID 16982)
-- Name: statuses_workspaces statuses_workspaces_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4927 (class 2606 OID 16972)
-- Name: statuses_workspaces statuses_workspaces_id_worker_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_worker_fkey FOREIGN KEY (id_worker) REFERENCES offices_management.workers(id_worker);


--
-- TOC entry 4928 (class 2606 OID 16977)
-- Name: statuses_workspaces statuses_workspaces_id_workspace_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_workspace_fkey FOREIGN KEY (id_workspace) REFERENCES offices_management.workspaces(id_workspace);


--
-- TOC entry 4929 (class 2606 OID 17403)
-- Name: statuses_workspaces statuses_workspaces_workspace_reservations_statuses_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_workspace_reservations_statuses_fk FOREIGN KEY (id_workspace_reservations_statuses) REFERENCES offices_management.workspace_reservations_statuses(id_workspace_reservations_statuses);


--
-- TOC entry 4919 (class 2606 OID 16895)
-- Name: workspaces workspaces_id_room_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces
    ADD CONSTRAINT workspaces_id_room_fkey FOREIGN KEY (id_room) REFERENCES offices_management.rooms(id_room);


-- Completed on 2025-02-17 16:38:42

--
-- PostgreSQL database dump complete
--

