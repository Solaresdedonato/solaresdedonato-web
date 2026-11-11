import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Link as RouterLink,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ROUTES } from "@/shared/router/routes";
import { useDesarrollosPublicados } from "@/features/desarrollo/hooks/useDesarrollo";
import { ordenarPorDisponibilidad } from "@/features/desarrollo/utils/ordenarPorDisponibilidad";
import type { Desarrollo } from "@/features/desarrollo/schemas/desarrollo.schema";
import { sinGuiones } from "@/shared/utils/sinGuiones";
import logo from "@/assets/logo.png";
import logoIcon from "@/assets/logo-icon.png";

const LINKS_ANTES = [{ href: "#nosotros", label: "Sobre nosotros" }];
const LINKS_DESPUES = [
  { href: "#invertir", label: "Invertí con nosotros" },
  { href: "#contacto", label: "Contacto" },
  { href: "#brokers", label: "Brokers" },
];

/** Menú desplegable con los desarrollos de un estado; cada ítem abre su ficha. */
function MenuDesarrollos({
  titulo,
  items,
}: {
  titulo: string;
  items: Desarrollo[];
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null);

  // Se cierra al elegir un desarrollo, al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  if (items.length === 0) return null;
  return (
    <li
      ref={ref}
      className={`rd-dd ${abierto ? "open" : ""}`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        type="button"
        className="rd-dd-btn"
        aria-expanded={abierto}
        aria-haspopup="true"
        onClick={() => setAbierto((v) => !v)}
      >
        {titulo}
        <span className="rd-dd-caret" aria-hidden="true" />
      </button>
      <div className="rd-dd-panel">
        <ul>
          {items.map((d) => (
            <li key={d.slug}>
              <RouterLink
                to={ROUTES.desarrolloDetalle(d.slug)}
                onClick={() => setAbierto(false)}
              >
                <span className="rd-dd-nombre">
                  {sinGuiones(d.nombre, " ")}
                </span>
                <span className="rd-dd-dir">
                  {sinGuiones(d.direccion)} · {d.zona}
                </span>
              </RouterLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/** Sección plegable del menú de celular con los desarrollos de un estado. */
function GrupoMovil({
  titulo,
  items,
  onElegir,
}: {
  titulo: string;
  items: Desarrollo[];
  onElegir: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  if (items.length === 0) return null;
  return (
    <li className={`rd-mm-grupo ${abierto ? "open" : ""}`}>
      <button
        type="button"
        className="rd-mm-link"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        {titulo}
        <span className="rd-dd-caret" aria-hidden="true" />
      </button>
      <ul className="rd-mm-sub" hidden={!abierto}>
        {items.map((d) => (
          <li key={d.slug}>
            <RouterLink
              to={ROUTES.desarrolloDetalle(d.slug)}
              onClick={onElegir}
            >
              <span className="rd-dd-nombre">{sinGuiones(d.nombre, " ")}</span>
              <span className="rd-dd-dir">
                {sinGuiones(d.direccion)} · {d.zona}
              </span>
            </RouterLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useDesarrollosPublicados();
  const desarrollos = data?.content ?? [];
  const enPozo = ordenarPorDisponibilidad(
    desarrollos.filter((d) => d.estado === "en-pozo"),
  );
  const entregados = ordenarPorDisponibilidad(
    desarrollos.filter((d) => d.estado === "entregado"),
  );
  // En el detalle de un desarrollo no tiene sentido ofrecer "ir al inicio" arriba de
  // todo: mostramos "Volver" en su lugar, en la misma posición del logo.
  const enDetalleDesarrollo = !!matchPath(
    "/desarrollos/:slug",
    location.pathname,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Con el menú de celular abierto la página de atrás no scrollea; Escape lo cierra.
  useEffect(() => {
    if (!menuMovil) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenuMovil(false);
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener("keydown", esc);
    };
  }, [menuMovil]);

  const cerrar = () => setMenuMovil(false);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      {enDetalleDesarrollo ? (
        <button
          type="button"
          className="pagina-dev-volver"
          onClick={() => navigate(-1)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
      ) : (
        <RouterLink to={ROUTES.home} className="nav-logo">
          {/* En anchos intermedios el isologo completo no entra sin pisar el menú — ahí se
           *  muestra solo el ícono (ver media query en original-landing.css). */}
          <img
            src={logo}
            alt="Solares de Donato — Desarrolladora"
            className="logo-img logo-img-full"
          />
          <img
            src={logoIcon}
            alt="Solares de Donato"
            className="logo-img logo-img-compact"
          />
        </RouterLink>
      )}
      <ul className="nav-links">
        {LINKS_ANTES.map((link) => (
          <li key={link.href}>
            <a href={`${ROUTES.home}${link.href}`}>{link.label}</a>
          </li>
        ))}
        <MenuDesarrollos titulo="En pozo" items={enPozo} />
        <MenuDesarrollos titulo="Entregados" items={entregados} />
        {LINKS_DESPUES.map((link) => (
          <li key={link.href}>
            <a href={`${ROUTES.home}${link.href}`}>{link.label}</a>
          </li>
        ))}
      </ul>
      <a href={`${ROUTES.home}#contacto`} className="nav-cta">
        Contacte con nosotros
      </a>

      {/* Celular (≤900px): el menú de arriba se oculta y aparece este botón. */}
      <button
        type="button"
        className={`rd-burger ${menuMovil ? "open" : ""}`}
        aria-label={menuMovil ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuMovil}
        aria-controls="rd-menu-movil"
        onClick={() => setMenuMovil((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {/* Portal al body: el nav con backdrop-filter haría que un hijo `fixed` quede
          recortado al alto del nav. Queda debajo del nav (z-index) así el botón sigue visible. */}
      {createPortal(
        <div
          id="rd-menu-movil"
          className={`rd-mm ${menuMovil ? "open" : ""}`}
          aria-hidden={!menuMovil}
          inert={!menuMovil}
        >
          <ul>
            {LINKS_ANTES.map((link) => (
              <li key={link.href}>
                <a
                  className="rd-mm-link"
                  href={`${ROUTES.home}${link.href}`}
                  onClick={cerrar}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <GrupoMovil titulo="En pozo" items={enPozo} onElegir={cerrar} />
            <GrupoMovil
              titulo="Entregados"
              items={entregados}
              onElegir={cerrar}
            />
            {LINKS_DESPUES.map((link) => (
              <li key={link.href}>
                <a
                  className="rd-mm-link"
                  href={`${ROUTES.home}${link.href}`}
                  onClick={cerrar}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="rd-mm-cta"
            href={`${ROUTES.home}#contacto`}
            onClick={cerrar}
          >
            Contacte con nosotros
          </a>
        </div>,
        document.body,
      )}
    </nav>
  );
}
