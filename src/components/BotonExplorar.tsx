import { useEffect, useRef } from "react";

const RADIO_IMAN = 170;

/**
 * "Explorar" de la portada: botón circular grande que lleva a la sección siguiente.
 * - Un anillo late suavemente y la flecha baja y sube para invitar a scrollear.
 * - Imán: cuando el mouse se acerca, el botón se corre hacia el cursor.
 * - Al pasar el mouse se llena de dorado y la flecha se alarga.
 * Con prefers-reduced-motion queda quieto (sin latido ni imán).
 */
export function BotonExplorar({ destino }: { destino: string }) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    if (window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const caja = el.getBoundingClientRect();
        const cx =
          caja.left +
          caja.width / 2 -
          (parseFloat(el.style.getPropertyValue("--mx")) || 0);
        const cy =
          caja.top +
          caja.height / 2 -
          (parseFloat(el.style.getPropertyValue("--my")) || 0);
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        const f = d < RADIO_IMAN ? (1 - d / RADIO_IMAN) * 0.45 : 0;
        el.style.setProperty("--mx", `${(dx * f).toFixed(1)}px`);
        el.style.setProperty("--my", `${(dy * f).toFixed(1)}px`);
        el.classList.toggle("cerca", f > 0);
      });
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={destino}
      className="rd-explorar"
      aria-label="Explorar: ir a Sobre nosotros"
    >
      <span className="rd-explorar-circulo">
        <span className="rd-explorar-pulso" aria-hidden="true" />
        <svg
          className="rd-explorar-flecha"
          viewBox="0 0 24 48"
          aria-hidden="true"
        >
          <line x1="12" y1="4" x2="12" y2="40" />
          <polyline points="5,33 12,41 19,33" />
        </svg>
      </span>
      <span className="rd-explorar-txt">Explorar</span>
    </a>
  );
}
