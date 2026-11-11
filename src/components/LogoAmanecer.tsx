import { useEffect, useRef, useState } from "react";
import logoIcon from "@/assets/logo-icon.png";

/**
 * El isologo como un amanecer ("Solares"): la línea dorada es el horizonte y el sol de la
 * marca empieza escondido debajo; cuando la sección entra en pantalla sale lentamente por
 * encima de la línea. Al final aparece el nombre. Se repite cada vez que se vuelve a la
 * sección. Nada gira; sin rayos ni resplandores, solo el sol y la línea.
 * Con prefers-reduced-motion se muestra ya salido.
 */
export function LogoAmanecer() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [salio, setSalio] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setSalio(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        // Sale cuando se ve buena parte; se "pone" de nuevo recién cuando quedó fuera de
        // pantalla, así la próxima visita vuelve a amanecer.
        if (e.intersectionRatio >= 0.45) setSalio(true);
        else if (!e.isIntersecting) setSalio(false);
      },
      { threshold: [0, 0.45] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`rd-sunrise ${salio ? "salio" : ""}`} ref={ref}>
      <div className="rd-sunrise-cielo" aria-hidden="true">
        <img className="rd-sunrise-sol" src={logoIcon} alt="" />
      </div>
      <span className="rd-sunrise-horizonte" aria-hidden="true" />
      <p className="rd-sunrise-marca">Solares de Donato</p>
      <p className="rd-sunrise-bajada">
        Desarrolladora inmobiliaria y constructora
      </p>
    </div>
  );
}
