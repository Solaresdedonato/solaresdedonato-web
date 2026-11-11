import { useRef } from "react";
import { useOnScroll } from "@/shared/hooks/useScrollFx";
import logoIcon from "@/assets/logo-icon.png";

/**
 * El isologo como un amanecer ("Solares"): el sol de la marca sale por detrás de una
 * línea de horizonte dorada a medida que se scrollea por Sobre nosotros, y debajo del
 * horizonte va el nombre de la empresa. Sobrio e institucional; nada gira.
 * Con prefers-reduced-motion el sol aparece ya salido.
 */
export function LogoAmanecer() {
  const ref = useRef<HTMLDivElement | null>(null);

  useOnScroll(() => {
    const el = ref.current;
    if (!el) return;
    let p = 1;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const seccion = (el.closest("section") ?? el).getBoundingClientRect();
      const h = window.innerHeight;
      // 0 cuando la sección empieza a entrar por abajo; 1 cuando su título llega arriba.
      p = Math.min(Math.max((h - seccion.top) / (h - 110), 0), 1);
    }
    const suave = 1 - Math.pow(1 - p, 3);
    el.style.setProperty("--sube", suave.toFixed(3));
  });

  return (
    <div className="rd-amanecer" ref={ref} aria-label="Solares de Donato">
      <div className="rd-amanecer-cielo" aria-hidden="true">
        <span className="rd-amanecer-halo" />
        <img className="rd-amanecer-sol" src={logoIcon} alt="" />
      </div>
      <span className="rd-amanecer-horizonte" aria-hidden="true" />
      <p className="rd-amanecer-marca">Solares de Donato</p>
      <p className="rd-amanecer-bajada">
        Desarrolladora inmobiliaria y constructora
      </p>
    </div>
  );
}
