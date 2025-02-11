--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-02-11 09:08:58

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
-- TOC entry 271 (class 1255 OID 17128)
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
-- TOC entry 272 (class 1255 OID 17129)
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
-- TOC entry 273 (class 1255 OID 17130)
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
-- TOC entry 275 (class 1255 OID 17132)
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
-- TOC entry 274 (class 1255 OID 17131)
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
-- TOC entry 276 (class 1255 OID 17133)
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
-- TOC entry 245 (class 1259 OID 16961)
-- Name: statuses_workspaces; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.statuses_workspaces (
    id_status_workspace integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    id_workspace integer NOT NULL,
    id_status integer,
    id_worker integer,
    id_user integer NOT NULL
);


ALTER TABLE offices_management.statuses_workspaces OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16927)
-- Name: workers; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workers (
    id_worker integer NOT NULL,
    name character varying(50) NOT NULL,
    surname character varying(50) NOT NULL,
    patronymic character varying(50)
);


ALTER TABLE offices_management.workers OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16918)
-- Name: workspace_statuses_types; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workspace_statuses_types (
    id_status integer NOT NULL,
    name character varying(45) NOT NULL,
    descriptions character varying(500)
);


ALTER TABLE offices_management.workspace_statuses_types OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16889)
-- Name: workspaces; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workspaces (
    id_workspace integer NOT NULL,
    name character varying(45) NOT NULL,
    id_room integer NOT NULL
);


ALTER TABLE offices_management.workspaces OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17305)
-- Name: current_workspaces; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.current_workspaces AS
 SELECT w.id_workspace,
    w.id_room,
    w.name AS workspace_name,
    wo.id_worker,
    concat_ws(' '::text, wo.name, wo.surname, wo.patronymic) AS full_worker_name,
    s.id_status_workspace,
    s.id_status,
    s.start_date,
    s.end_date,
    st.name AS status_name
   FROM (((offices_management.workspaces w
     JOIN offices_management.statuses_workspaces s ON ((w.id_workspace = s.id_workspace)))
     LEFT JOIN offices_management.workers wo ON ((s.id_worker = wo.id_worker)))
     LEFT JOIN offices_management.workspace_statuses_types st ON ((s.id_status = st.id_status)))
  WHERE (((s.end_date IS NULL) OR (s.end_date > CURRENT_DATE)) AND (s.start_date < CURRENT_DATE));


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
-- TOC entry 5131 (class 0 OID 0)
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
    scheme character varying(100),
    id_office integer NOT NULL,
    square integer
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
-- TOC entry 5132 (class 0 OID 0)
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
-- TOC entry 259 (class 1259 OID 17339)
-- Name: history_workspace_statuses; Type: VIEW; Schema: offices_management; Owner: postgres
--

CREATE VIEW offices_management.history_workspace_statuses AS
 SELECT sw.id_workspace,
    sw.id_status_workspace,
    sw.start_date,
    sw.end_date,
    wst.name AS status_type,
    concat(wo.name, ' ', wo.surname, ' ', COALESCE(wo.patronymic, ''::character varying)) AS worker_full_name,
    u.name AS user_name
   FROM (((offices_management.statuses_workspaces sw
     LEFT JOIN offices_management.workspace_statuses_types wst ON ((sw.id_status = wst.id_status)))
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
    total_workspace integer
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
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 220
-- Name: offices_id_office_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.offices_id_office_seq OWNED BY offices_management.offices.id_office;


--
-- TOC entry 251 (class 1259 OID 17040)
-- Name: offices_status; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.offices_status (
    id_office_status integer NOT NULL,
    name character varying(30) NOT NULL
);


ALTER TABLE offices_management.offices_status OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 17039)
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
-- TOC entry 5134 (class 0 OID 0)
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
-- TOC entry 5135 (class 0 OID 0)
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
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 230
-- Name: reports_id_report_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.reports_id_report_seq OWNED BY offices_management.reports.id_report;


--
-- TOC entry 247 (class 1259 OID 17005)
-- Name: reports_types; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.reports_types (
    id_reports_types integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE offices_management.reports_types OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17004)
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
-- TOC entry 249 (class 1259 OID 17022)
-- Name: reservation_statuse; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.reservation_statuse (
    id_reservations_statuses integer NOT NULL,
    name character varying(30) NOT NULL
);


ALTER TABLE offices_management.reservation_statuse OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16901)
-- Name: reservations; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.reservations (
    id_reservations integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    id_reservation_status integer,
    id_workspace integer NOT NULL,
    id_user integer NOT NULL
);


ALTER TABLE offices_management.reservations OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16900)
-- Name: reservations_id_reservations_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

CREATE SEQUENCE offices_management.reservations_id_reservations_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE offices_management.reservations_id_reservations_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 236
-- Name: reservations_id_reservations_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.reservations_id_reservations_seq OWNED BY offices_management.reservations.id_reservations;


--
-- TOC entry 248 (class 1259 OID 17021)
-- Name: reservations_statuses_id_reservations_statuses_seq; Type: SEQUENCE; Schema: offices_management; Owner: postgres
--

ALTER TABLE offices_management.reservation_statuse ALTER COLUMN id_reservations_statuses ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME offices_management.reservations_statuses_id_reservations_statuses_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 253 (class 1259 OID 17097)
-- Name: room_status; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.room_status (
    id_room_status integer NOT NULL,
    name character varying(30) NOT NULL,
    descriptions character varying(100)
);


ALTER TABLE offices_management.room_status OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17096)
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
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 232
-- Name: rooms_id_room_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.rooms_id_room_seq OWNED BY offices_management.rooms.id_room;


--
-- TOC entry 238 (class 1259 OID 16917)
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
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 238
-- Name: statuses_id_statuses_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.statuses_id_statuses_seq OWNED BY offices_management.workspace_statuses_types.id_status;


--
-- TOC entry 243 (class 1259 OID 16934)
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
-- TOC entry 242 (class 1259 OID 16933)
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
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 242
-- Name: statuses_workers_id_status_worker_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.statuses_workers_id_status_worker_seq OWNED BY offices_management.statuses_workers.id_status_worker;


--
-- TOC entry 244 (class 1259 OID 16960)
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
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 244
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
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_user_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.users_id_user_seq OWNED BY offices_management.users.id_user;


--
-- TOC entry 257 (class 1259 OID 17311)
-- Name: workers_statuses_types; Type: TABLE; Schema: offices_management; Owner: postgres
--

CREATE TABLE offices_management.workers_statuses_types (
    id_status integer NOT NULL,
    name character varying(30) NOT NULL,
    description character varying(500)
);


ALTER TABLE offices_management.workers_statuses_types OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17328)
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
-- TOC entry 240 (class 1259 OID 16926)
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
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 240
-- Name: workers_id_worker_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.workers_id_worker_seq OWNED BY offices_management.workers.id_worker;


--
-- TOC entry 256 (class 1259 OID 17310)
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
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 234
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE OWNED BY; Schema: offices_management; Owner: postgres
--

ALTER SEQUENCE offices_management.workspaces_id_workspace_seq OWNED BY offices_management.workspaces.id_workspace;


--
-- TOC entry 4854 (class 2604 OID 16802)
-- Name: departments id_department; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.departments ALTER COLUMN id_department SET DEFAULT nextval('offices_management.departments_id_department_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 16829)
-- Name: floors id_floor; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors ALTER COLUMN id_floor SET DEFAULT nextval('offices_management.floors_id_floor_seq'::regclass);


--
-- TOC entry 4855 (class 2604 OID 17065)
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
-- TOC entry 4864 (class 2604 OID 16904)
-- Name: reservations id_reservations; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservations ALTER COLUMN id_reservations SET DEFAULT nextval('offices_management.reservations_id_reservations_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 16879)
-- Name: rooms id_room; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms ALTER COLUMN id_room SET DEFAULT nextval('offices_management.rooms_id_room_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16937)
-- Name: statuses_workers id_status_worker; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers ALTER COLUMN id_status_worker SET DEFAULT nextval('offices_management.statuses_workers_id_status_worker_seq'::regclass);


--
-- TOC entry 4868 (class 2604 OID 16964)
-- Name: statuses_workspaces id_status_workspace; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces ALTER COLUMN id_status_workspace SET DEFAULT nextval('offices_management.statuses_workspaces_id_status_workspace_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 16819)
-- Name: users id_user; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users ALTER COLUMN id_user SET DEFAULT nextval('offices_management.users_id_user_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 16930)
-- Name: workers id_worker; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers ALTER COLUMN id_worker SET DEFAULT nextval('offices_management.workers_id_worker_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 16921)
-- Name: workspace_statuses_types id_status; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_statuses_types ALTER COLUMN id_status SET DEFAULT nextval('offices_management.statuses_id_statuses_seq'::regclass);


--
-- TOC entry 4863 (class 2604 OID 16892)
-- Name: workspaces id_workspace; Type: DEFAULT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces ALTER COLUMN id_workspace SET DEFAULT nextval('offices_management.workspaces_id_workspace_seq'::regclass);


--
-- TOC entry 5089 (class 0 OID 16799)
-- Dependencies: 219
-- Data for Name: departments; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.departments VALUES (1, 'Отдел продаж', 'Отдел, занимающийся продажами и взаимодействием с клиентами.');
INSERT INTO offices_management.departments VALUES (2, 'Отдел маркетинга', 'Отдел, отвечающий за маркетинговые стратегии и рекламные кампании.');
INSERT INTO offices_management.departments VALUES (3, 'Отдел разработки', 'Отдел, занимающийся разработкой программного обеспечения и технологий.');
INSERT INTO offices_management.departments VALUES (4, 'Отдел кадров', 'Отдел, занимающийся управлением персоналом и кадровыми вопросами.');
INSERT INTO offices_management.departments VALUES (5, 'Финансовый отдел', 'Отдел, отвечающий за финансовое планирование и учет.');
INSERT INTO offices_management.departments VALUES (6, 'Отдел поддержки', 'Отдел, предоставляющий техническую поддержку и помощь клиентам.');


--
-- TOC entry 5095 (class 0 OID 16826)
-- Dependencies: 225
-- Data for Name: floors; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.floors VALUES (2, 1, 20, NULL, 10, 100);
INSERT INTO offices_management.floors VALUES (3, 2, 20, NULL, 10, 100);
INSERT INTO offices_management.floors VALUES (4, 2, 35, NULL, 11, 160);
INSERT INTO offices_management.floors VALUES (5, 1, 23, NULL, 12, 130);
INSERT INTO offices_management.floors VALUES (12, 1, 10, '', 2, 100);
INSERT INTO offices_management.floors VALUES (13, 2, 15, '', 2, 100);
INSERT INTO offices_management.floors VALUES (7, 1, 5, '', 4, 60);
INSERT INTO offices_management.floors VALUES (8, 1, 10, '', 5, 90);
INSERT INTO offices_management.floors VALUES (9, 1, 10, '', 6, 100);
INSERT INTO offices_management.floors VALUES (10, 1, 15, '', 1, 75);
INSERT INTO offices_management.floors VALUES (11, 2, 15, '', 1, 75);
INSERT INTO offices_management.floors VALUES (1, 1, 30, '', 3, 150);
INSERT INTO offices_management.floors VALUES (6, 2, 30, '', 3, 150);


--
-- TOC entry 5091 (class 0 OID 16808)
-- Dependencies: 221
-- Data for Name: offices; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.offices VALUES (1, 'Офис на Невском', 'Невский проспект, 100, Санкт-Петербург', 1, 150, 'office1.jpg', 30);
INSERT INTO offices_management.offices VALUES (4, 'Офис "Технологии"', 'Улица Льва Толстого, 5, Казань', 1, 120, 'office1.jpg', 20);
INSERT INTO offices_management.offices VALUES (10, 'Головной', 'Адмирала Кузницова 3', 1, 200, 'office1.jpg', 40);
INSERT INTO offices_management.offices VALUES (11, 'Проектный', 'пр. Космонавтов 32', 2, 160, 'office2.jpeg', 30);
INSERT INTO offices_management.offices VALUES (2, 'Коворкинг в центре', 'Тверская улица, 15, Москва', 2, 200, 'office2.jpeg', 40);
INSERT INTO offices_management.offices VALUES (5, 'Коворкинг "Креатив"', 'Улица Садовая, 20, Екатеринбург', 2, 180, 'office2.jpeg', 35);
INSERT INTO offices_management.offices VALUES (3, 'Бизнес-центр "Сити"', 'Пресненская набережная, 12, Москва', 1, 300, 'office3.jpg', 60);
INSERT INTO offices_management.offices VALUES (6, 'Офис "Инновации"', 'Улица Пушкина, 7, Новосибирск', 1, 160, 'office3.jpg', 30);
INSERT INTO offices_management.offices VALUES (12, 'Бугалтерия', 'пр. Моксковский 42', 2, 130, 'office3.jpg', 25);


--
-- TOC entry 5121 (class 0 OID 17040)
-- Dependencies: 251
-- Data for Name: offices_status; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.offices_status OVERRIDING SYSTEM VALUE VALUES (1, 'арендованый');
INSERT INTO offices_management.offices_status OVERRIDING SYSTEM VALUE VALUES (2, 'в собственности');


--
-- TOC entry 5097 (class 0 OID 16838)
-- Dependencies: 227
-- Data for Name: posts; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.posts VALUES (1, 'Менеджер по продажам', 'Отвечает за продажи и взаимодействие с клиентами.');
INSERT INTO offices_management.posts VALUES (2, 'Маркетолог', 'Разрабатывает и реализует маркетинговые стратегии.');
INSERT INTO offices_management.posts VALUES (3, 'Разработчик', 'Занимается разработкой программного обеспечения.');
INSERT INTO offices_management.posts VALUES (4, 'HR-менеджер', 'Управляет процессами подбора и адаптации персонала.');
INSERT INTO offices_management.posts VALUES (5, 'Финансовый аналитик', 'Анализирует финансовые данные и составляет отчеты.');
INSERT INTO offices_management.posts VALUES (6, 'Техник поддержки', 'Предоставляет техническую поддержку пользователям.');
INSERT INTO offices_management.posts VALUES (7, 'Дизайнер', 'Создает визуальные концепции и графические элементы.');
INSERT INTO offices_management.posts VALUES (8, 'Аналитик данных', 'Изучает и интерпретирует данные для принятия решений.');


--
-- TOC entry 5099 (class 0 OID 16847)
-- Dependencies: 229
-- Data for Name: rental_agreements; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.rental_agreements VALUES (1, '2023-02-10', NULL, 1200000, NULL, 3, 1);


--
-- TOC entry 5101 (class 0 OID 16864)
-- Dependencies: 231
-- Data for Name: reports; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.reports VALUES (36, 1, '2025-02-06', 'Отчет_Бизнес-центр_Сити_20250206_12_08.xlsx', 1);
INSERT INTO offices_management.reports VALUES (37, 1, '2025-02-06', 'Отчет_Бизнес-центр_Сити_20250206_12_08.xlsx', 1);
INSERT INTO offices_management.reports VALUES (38, 1, '2025-02-06', 'Отчет_Бизнес-центр_Сити_20250206_12_09.xlsx', 1);
INSERT INTO offices_management.reports VALUES (39, 1, '2025-02-06', 'Отчет_Бизнес-центр_Сити_20250206_1630.xlsx', 1);
INSERT INTO offices_management.reports VALUES (40, 1, '2025-02-07', 'Отчет_Бизнес-центр_Сити_20250207_1141.xlsx', 1);
INSERT INTO offices_management.reports VALUES (41, 1, '2025-02-10', 'Отчет_Бизнес-центр_Сити_20250210_1059.xlsx', 1);


--
-- TOC entry 5117 (class 0 OID 17005)
-- Dependencies: 247
-- Data for Name: reports_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.reports_types OVERRIDING SYSTEM VALUE VALUES (1, 'Отчёт о стоимости аренды офиса');


--
-- TOC entry 5119 (class 0 OID 17022)
-- Dependencies: 249
-- Data for Name: reservation_statuse; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5107 (class 0 OID 16901)
-- Dependencies: 237
-- Data for Name: reservations; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5123 (class 0 OID 17097)
-- Dependencies: 253
-- Data for Name: room_status; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.room_status OVERRIDING SYSTEM VALUE VALUES (1, 'гостевой', 'Для временного размещения сотрудников');
INSERT INTO offices_management.room_status OVERRIDING SYSTEM VALUE VALUES (2, 'основной', 'Для сотрудников на постоянной основе');


--
-- TOC entry 5103 (class 0 OID 16876)
-- Dependencies: 233
-- Data for Name: rooms; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.rooms VALUES (1, '101', 3, 1, 25, NULL);
INSERT INTO offices_management.rooms VALUES (2, '102', 3, 1, 25, NULL);
INSERT INTO offices_management.rooms VALUES (3, '103', 3, 1, 25, NULL);
INSERT INTO offices_management.rooms VALUES (7, '301', 5, 1, 50, NULL);
INSERT INTO offices_management.rooms VALUES (8, '302', 5, 1, 50, NULL);
INSERT INTO offices_management.rooms VALUES (9, '303a', 5, 1, 50, NULL);
INSERT INTO offices_management.rooms VALUES (13, '501', 5, 1, 75, NULL);
INSERT INTO offices_management.rooms VALUES (14, '502', 5, 1, 75, NULL);
INSERT INTO offices_management.rooms VALUES (15, '503', 5, 1, 75, NULL);
INSERT INTO offices_management.rooms VALUES (19, '701', 2, 1, 30, NULL);
INSERT INTO offices_management.rooms VALUES (20, '702', 2, 1, 30, NULL);
INSERT INTO offices_management.rooms VALUES (21, '801', 4, 1, 40, NULL);
INSERT INTO offices_management.rooms VALUES (22, '802', 4, 1, 40, NULL);
INSERT INTO offices_management.rooms VALUES (23, '901', 3, 1, 30, NULL);
INSERT INTO offices_management.rooms VALUES (24, '902a', 3, 1, 30, NULL);
INSERT INTO offices_management.rooms VALUES (4, '201', 3, 6, 25, NULL);
INSERT INTO offices_management.rooms VALUES (5, '202', 3, 6, 25, NULL);
INSERT INTO offices_management.rooms VALUES (6, '203', 3, 6, 25, NULL);
INSERT INTO offices_management.rooms VALUES (10, '401', 5, 6, 50, NULL);
INSERT INTO offices_management.rooms VALUES (11, '402', 5, 6, 50, NULL);
INSERT INTO offices_management.rooms VALUES (12, '403', 5, 6, 50, NULL);
INSERT INTO offices_management.rooms VALUES (16, '601a', 5, 6, 75, NULL);
INSERT INTO offices_management.rooms VALUES (17, '602', 5, 6, 75, NULL);
INSERT INTO offices_management.rooms VALUES (18, '603', 5, 6, 75, NULL);


--
-- TOC entry 5113 (class 0 OID 16934)
-- Dependencies: 243
-- Data for Name: statuses_workers; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.statuses_workers VALUES (1, '2023-01-01', '2023-01-31', 1, 1, 1, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (2, '2023-02-01', NULL, 2, 2, 2, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (3, '2023-03-01', NULL, 3, 3, 3, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (4, '2023-04-01', NULL, 4, 4, 4, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (5, '2023-05-01', NULL, 5, 5, 5, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (6, '2023-06-01', NULL, 6, 6, 6, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (7, '2023-07-01', NULL, 7, 1, 7, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (8, '2023-08-01', NULL, 8, 2, 8, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (9, '2023-09-01', NULL, 1, 3, 9, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (10, '2023-10-01', NULL, 2, 4, 10, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (12, '2023-04-21', '2023-08-27', 2, 2, 1, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (11, '2023-02-01', '2023-04-20', 2, 1, 1, 1, NULL);
INSERT INTO offices_management.statuses_workers VALUES (13, '2023-08-28', '2025-06-30', 3, 2, 1, 1, NULL);


--
-- TOC entry 5115 (class 0 OID 16961)
-- Dependencies: 245
-- Data for Name: statuses_workspaces; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.statuses_workspaces VALUES (2, '2023-01-01', '2023-01-20', 1, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (3, '2023-01-21', '2023-01-23', 1, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (15, '2023-01-12', NULL, 12, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (16, '2023-01-13', NULL, 13, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (17, '2023-01-14', NULL, 14, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (18, '2023-01-15', NULL, 15, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (19, '2023-01-16', NULL, 16, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (20, '2023-01-17', NULL, 17, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (21, '2023-01-18', NULL, 18, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (22, '2023-01-19', NULL, 19, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (23, '2023-01-20', NULL, 20, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (24, '2023-01-21', NULL, 21, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (25, '2023-01-22', NULL, 22, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (26, '2023-01-23', NULL, 23, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (9, '2023-01-06', '2026-01-07', 6, NULL, 6, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (10, '2023-01-07', '2026-01-08', 7, NULL, 7, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (11, '2023-01-08', '2026-01-09', 8, NULL, 8, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (12, '2023-01-09', '2026-01-10', 9, NULL, 9, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (13, '2023-01-10', '2026-01-11', 10, NULL, 10, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (4, '2023-01-24', '2023-05-24', 1, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (31, '2025-08-30', NULL, 1, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (27, '2023-05-25', '2023-10-30', 1, NULL, 2, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (30, '2023-10-30', '2025-08-30', 1, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (14, '2023-01-11', NULL, 11, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (6, '2023-01-03', '2024-10-26', 3, NULL, 3, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (5, '2023-01-02', '2023-05-30', 2, NULL, 2, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (28, '2023-05-30', '2025-04-30', 2, NULL, 1, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (37, '2024-10-01', NULL, 4, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (7, '2023-01-04', '2024-10-01', 4, NULL, 4, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (34, '2024-10-26', '2025-01-10', 3, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (36, '2025-01-10', NULL, 3, NULL, 3, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (8, '2023-01-05', '2024-10-28', 5, NULL, 5, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (38, '2024-10-28', '2024-11-20', 5, NULL, NULL, 1);
INSERT INTO offices_management.statuses_workspaces VALUES (39, '2024-11-20', '2025-03-20', 5, NULL, 1, 1);


--
-- TOC entry 5093 (class 0 OID 16816)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.users VALUES (1, 'admin', '\x8cdd9346bbdb6f67e399c48eaca610ea030fb6f2131bb43680e077c14a688cc9', 'Пискаев', 'Арсений', 'Романович', false, 'b1f850f7-d7ff-400e-b143-3fac6e6fe65c');


--
-- TOC entry 5111 (class 0 OID 16927)
-- Dependencies: 241
-- Data for Name: workers; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workers VALUES (1, 'Иван', 'Иванов', 'Иванович');
INSERT INTO offices_management.workers VALUES (2, 'Петр', 'Петров', 'Петрович');
INSERT INTO offices_management.workers VALUES (3, 'Светлана', 'Сидорова', 'Алексеевна');
INSERT INTO offices_management.workers VALUES (4, 'Анна', 'Кузнецова', 'Сергеевна');
INSERT INTO offices_management.workers VALUES (5, 'Дмитрий', 'Смирнов', 'Александрович');
INSERT INTO offices_management.workers VALUES (6, 'Елена', 'Попова', 'Викторовна');
INSERT INTO offices_management.workers VALUES (7, 'Алексей', 'Морозов', 'Николаевич');
INSERT INTO offices_management.workers VALUES (8, 'Мария', 'Федорова', 'Павловна');
INSERT INTO offices_management.workers VALUES (9, 'Ольга', 'Семенова', 'Дмитриевна');
INSERT INTO offices_management.workers VALUES (10, 'Николай', 'Ковалев', 'Станиславович');


--
-- TOC entry 5125 (class 0 OID 17311)
-- Dependencies: 257
-- Data for Name: workers_statuses_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workers_statuses_types OVERRIDING SYSTEM VALUE VALUES (1, 'Дикрет', NULL);
INSERT INTO offices_management.workers_statuses_types OVERRIDING SYSTEM VALUE VALUES (3, 'Командировка', NULL);
INSERT INTO offices_management.workers_statuses_types OVERRIDING SYSTEM VALUE VALUES (2, 'Срочная военная служба', NULL);


--
-- TOC entry 5109 (class 0 OID 16918)
-- Dependencies: 239
-- Data for Name: workspace_statuses_types; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--



--
-- TOC entry 5105 (class 0 OID 16889)
-- Dependencies: 235
-- Data for Name: workspaces; Type: TABLE DATA; Schema: offices_management; Owner: postgres
--

INSERT INTO offices_management.workspaces VALUES (1, '001A', 1);
INSERT INTO offices_management.workspaces VALUES (2, '001B', 1);
INSERT INTO offices_management.workspaces VALUES (3, '001C', 1);
INSERT INTO offices_management.workspaces VALUES (4, '002A', 2);
INSERT INTO offices_management.workspaces VALUES (5, '002B', 2);
INSERT INTO offices_management.workspaces VALUES (6, '002C', 2);
INSERT INTO offices_management.workspaces VALUES (7, '003A', 3);
INSERT INTO offices_management.workspaces VALUES (8, '003B', 3);
INSERT INTO offices_management.workspaces VALUES (9, '003C', 3);
INSERT INTO offices_management.workspaces VALUES (10, '004A', 4);
INSERT INTO offices_management.workspaces VALUES (11, '004B', 4);
INSERT INTO offices_management.workspaces VALUES (12, '005A', 5);
INSERT INTO offices_management.workspaces VALUES (13, '005B', 5);
INSERT INTO offices_management.workspaces VALUES (14, '006A', 6);
INSERT INTO offices_management.workspaces VALUES (15, '006B', 6);
INSERT INTO offices_management.workspaces VALUES (16, '007A', 7);
INSERT INTO offices_management.workspaces VALUES (17, '008A', 8);
INSERT INTO offices_management.workspaces VALUES (18, '009A', 9);
INSERT INTO offices_management.workspaces VALUES (19, '010A', 10);
INSERT INTO offices_management.workspaces VALUES (20, '011A', 11);
INSERT INTO offices_management.workspaces VALUES (21, '012A', 12);
INSERT INTO offices_management.workspaces VALUES (22, '013A', 13);
INSERT INTO offices_management.workspaces VALUES (23, '014A', 14);


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 218
-- Name: departments_id_department_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.departments_id_department_seq', 5, true);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 224
-- Name: floors_id_floor_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.floors_id_floor_seq', 5, true);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 220
-- Name: offices_id_office_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.offices_id_office_seq', 12, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 250
-- Name: offices_status_id_office_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.offices_status_id_office_status_seq', 2, true);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 226
-- Name: posts_id_post_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.posts_id_post_seq', 1, false);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 228
-- Name: rental_agreements_id_rental_agreement_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.rental_agreements_id_rental_agreement_seq', 1, true);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 230
-- Name: reports_id_report_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reports_id_report_seq', 41, true);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 246
-- Name: reports_types_id_reports_types_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reports_types_id_reports_types_seq', 1, true);


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 236
-- Name: reservations_id_reservations_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reservations_id_reservations_seq', 1, false);


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 248
-- Name: reservations_statuses_id_reservations_statuses_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.reservations_statuses_id_reservations_statuses_seq', 1, false);


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 252
-- Name: room_status_id_room_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.room_status_id_room_status_seq', 2, true);


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 232
-- Name: rooms_id_room_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.rooms_id_room_seq', 1, true);


--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 238
-- Name: statuses_id_statuses_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_id_statuses_seq', 1, false);


--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 242
-- Name: statuses_workers_id_status_worker_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_workers_id_status_worker_seq', 13, true);


--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 244
-- Name: statuses_workspaces_id_status_workspace_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.statuses_workspaces_id_status_workspace_seq', 39, true);


--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.users_id_user_seq', 1, true);


--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 240
-- Name: workers_id_worker_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workers_id_worker_seq', 1, false);


--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 256
-- Name: workers_statuses_types_id_status_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workers_statuses_types_id_status_seq', 3, true);


--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 234
-- Name: workspaces_id_workspace_seq; Type: SEQUENCE SET; Schema: offices_management; Owner: postgres
--

SELECT pg_catalog.setval('offices_management.workspaces_id_workspace_seq', 1, false);


--
-- TOC entry 4870 (class 2606 OID 16806)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id_department);


--
-- TOC entry 4878 (class 2606 OID 16831)
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id_floor);


--
-- TOC entry 4872 (class 2606 OID 17067)
-- Name: offices offices_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices
    ADD CONSTRAINT offices_pkey PRIMARY KEY (id_office);


--
-- TOC entry 4908 (class 2606 OID 17044)
-- Name: offices_status offices_status_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices_status
    ADD CONSTRAINT offices_status_pk PRIMARY KEY (id_office_status);


--
-- TOC entry 4910 (class 2606 OID 17046)
-- Name: offices_status offices_status_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices_status
    ADD CONSTRAINT offices_status_unique UNIQUE (name);


--
-- TOC entry 4880 (class 2606 OID 16845)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id_post);


--
-- TOC entry 4882 (class 2606 OID 16852)
-- Name: rental_agreements rental_agreements_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_pkey PRIMARY KEY (id_rental_agreement);


--
-- TOC entry 4884 (class 2606 OID 16869)
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
-- TOC entry 4890 (class 2606 OID 16906)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id_reservations);


--
-- TOC entry 4904 (class 2606 OID 17026)
-- Name: reservation_statuse reservations_statuses_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservation_statuse
    ADD CONSTRAINT reservations_statuses_pk PRIMARY KEY (id_reservations_statuses);


--
-- TOC entry 4906 (class 2606 OID 17028)
-- Name: reservation_statuse reservations_statuses_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservation_statuse
    ADD CONSTRAINT reservations_statuses_unique UNIQUE (name);


--
-- TOC entry 4912 (class 2606 OID 17101)
-- Name: room_status room_status_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.room_status
    ADD CONSTRAINT room_status_pk PRIMARY KEY (id_room_status);


--
-- TOC entry 4914 (class 2606 OID 17103)
-- Name: room_status room_status_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.room_status
    ADD CONSTRAINT room_status_unique UNIQUE (name);


--
-- TOC entry 4886 (class 2606 OID 16882)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id_room);


--
-- TOC entry 4892 (class 2606 OID 16925)
-- Name: workspace_statuses_types statuses_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspace_statuses_types
    ADD CONSTRAINT statuses_pkey PRIMARY KEY (id_status);


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
-- TOC entry 4874 (class 2606 OID 16824)
-- Name: users users_login_key; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- TOC entry 4876 (class 2606 OID 16822)
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
-- TOC entry 4916 (class 2606 OID 17317)
-- Name: workers_statuses_types workers_statuses_types_pk; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers_statuses_types
    ADD CONSTRAINT workers_statuses_types_pk PRIMARY KEY (id_status);


--
-- TOC entry 4918 (class 2606 OID 17319)
-- Name: workers_statuses_types workers_statuses_types_unique; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workers_statuses_types
    ADD CONSTRAINT workers_statuses_types_unique UNIQUE (name);


--
-- TOC entry 4888 (class 2606 OID 16894)
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id_workspace);


--
-- TOC entry 4920 (class 2606 OID 17068)
-- Name: floors floors_id_office_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.floors
    ADD CONSTRAINT floors_id_office_fkey FOREIGN KEY (id_office) REFERENCES offices_management.offices(id_office);


--
-- TOC entry 4919 (class 2606 OID 17047)
-- Name: offices offices_offices_status_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.offices
    ADD CONSTRAINT offices_offices_status_fk FOREIGN KEY (id_office_status) REFERENCES offices_management.offices_status(id_office_status);


--
-- TOC entry 4921 (class 2606 OID 17073)
-- Name: rental_agreements rental_agreements_id_office_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_id_office_fkey FOREIGN KEY (id_office) REFERENCES offices_management.offices(id_office);


--
-- TOC entry 4922 (class 2606 OID 16858)
-- Name: rental_agreements rental_agreements_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rental_agreements
    ADD CONSTRAINT rental_agreements_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4923 (class 2606 OID 16870)
-- Name: reports reports_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4924 (class 2606 OID 17012)
-- Name: reports reports_reports_types_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reports
    ADD CONSTRAINT reports_reports_types_fk FOREIGN KEY (id_reports_types) REFERENCES offices_management.reports_types(id_reports_types);


--
-- TOC entry 4928 (class 2606 OID 16907)
-- Name: reservations reservations_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservations
    ADD CONSTRAINT reservations_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4929 (class 2606 OID 16912)
-- Name: reservations reservations_id_workspace_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservations
    ADD CONSTRAINT reservations_id_workspace_fkey FOREIGN KEY (id_workspace) REFERENCES offices_management.workspaces(id_workspace);


--
-- TOC entry 4930 (class 2606 OID 17029)
-- Name: reservations reservations_reservations_statuses_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.reservations
    ADD CONSTRAINT reservations_reservations_statuses_fk FOREIGN KEY (id_reservation_status) REFERENCES offices_management.reservation_statuse(id_reservations_statuses);


--
-- TOC entry 4925 (class 2606 OID 16883)
-- Name: rooms rooms_id_floor_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_id_floor_fkey FOREIGN KEY (id_floor) REFERENCES offices_management.floors(id_floor);


--
-- TOC entry 4926 (class 2606 OID 17104)
-- Name: rooms rooms_room_status_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.rooms
    ADD CONSTRAINT rooms_room_status_fk FOREIGN KEY (id_room_status) REFERENCES offices_management.room_status(id_room_status);


--
-- TOC entry 4931 (class 2606 OID 16945)
-- Name: statuses_workers statuses_workers_departments_id_department_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_departments_id_department_fkey FOREIGN KEY (id_department) REFERENCES offices_management.departments(id_department);


--
-- TOC entry 4932 (class 2606 OID 16955)
-- Name: statuses_workers statuses_workers_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4933 (class 2606 OID 16950)
-- Name: statuses_workers statuses_workers_id_worker_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_id_worker_fkey FOREIGN KEY (id_worker) REFERENCES offices_management.workers(id_worker);


--
-- TOC entry 4934 (class 2606 OID 16940)
-- Name: statuses_workers statuses_workers_posts_id_post_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_posts_id_post_fkey FOREIGN KEY (id_post) REFERENCES offices_management.posts(id_post);


--
-- TOC entry 4935 (class 2606 OID 17320)
-- Name: statuses_workers statuses_workers_workers_statuses_types_fk; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workers
    ADD CONSTRAINT statuses_workers_workers_statuses_types_fk FOREIGN KEY (id_status) REFERENCES offices_management.workers_statuses_types(id_status);


--
-- TOC entry 4936 (class 2606 OID 16967)
-- Name: statuses_workspaces statuses_workspaces_id_statuses_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_statuses_fkey FOREIGN KEY (id_status) REFERENCES offices_management.workspace_statuses_types(id_status);


--
-- TOC entry 4937 (class 2606 OID 16982)
-- Name: statuses_workspaces statuses_workspaces_id_user_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_user_fkey FOREIGN KEY (id_user) REFERENCES offices_management.users(id_user);


--
-- TOC entry 4938 (class 2606 OID 16972)
-- Name: statuses_workspaces statuses_workspaces_id_worker_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_worker_fkey FOREIGN KEY (id_worker) REFERENCES offices_management.workers(id_worker);


--
-- TOC entry 4939 (class 2606 OID 16977)
-- Name: statuses_workspaces statuses_workspaces_id_workspace_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.statuses_workspaces
    ADD CONSTRAINT statuses_workspaces_id_workspace_fkey FOREIGN KEY (id_workspace) REFERENCES offices_management.workspaces(id_workspace);


--
-- TOC entry 4927 (class 2606 OID 16895)
-- Name: workspaces workspaces_id_room_fkey; Type: FK CONSTRAINT; Schema: offices_management; Owner: postgres
--

ALTER TABLE ONLY offices_management.workspaces
    ADD CONSTRAINT workspaces_id_room_fkey FOREIGN KEY (id_room) REFERENCES offices_management.rooms(id_room);


-- Completed on 2025-02-11 09:08:58

--
-- PostgreSQL database dump complete
--

