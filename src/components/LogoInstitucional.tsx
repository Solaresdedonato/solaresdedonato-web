import { useEffect, useRef } from "react";
import logo from "@/assets/logo.png";

/**
 * Placa institucional de la marca (Sobre nosotros): el isologo completo dentro de un
 * marco dorado fino, con la bajada de la empresa. Interactiva pero sobria: se inclina
 * levemente en 3D siguiendo el mouse y un reflejo suave recorre la placa, como una
 * placa de metal. Sin giros ni animaciones automáticas; con prefers-reduced-motion
 * queda quieta.
 */
export function LogoInstitucional() {
  const placaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const placa = placaRef.current;
    if (!placa || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let raf = 0;
    const mover = (e: PointerEvent) => {
      const caja = placa.getBoundingClientRect();
      const x = (e.clientX - caja.left) / caja.width - 0.5;
      const y = (e.clientY - caja.top) / caja.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        placa.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
        placa.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
        placa.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
        placa.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
        placa.classList.add("activa");
      });
    };
    const salir = () => {
      cancelAnimationFrame(raf);
      placa.style.setProperty("--rx", "0deg");
      placa.style.setProperty("--ry", "0deg");
      placa.classList.remove("activa");
    };
    placa.addEventListener("pointermove", mover);
    placa.addEventListener("pointerleave", salir);
    return () => {
      placa.removeEventListener("pointermove", mover);
      placa.removeEventListener("pointerleave", salir);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="rd-placa-escena">
      <div className="rd-placa" ref={placaRef}>
        <span className="rd-placa-esq tl" aria-hidden="true" />
        <span className="rd-placa-esq tr" aria-hidden="true" />
        <span className="rd-placa-esq bl" aria-hidden="true" />
        <span className="rd-placa-esq br" aria-hidden="true" />
        <img className="rd-placa-logo" src={logo} alt="Solares de Donato" />
        <span className="rd-placa-linea" aria-hidden="true" />
        <p className="rd-placa-bajada">
          Desarrolladora inmobiliaria y constructora
        </p>
        <p className="rd-placa-sub">CABA · Pinamar · Más de 25 años</p>
        <span className="rd-placa-brillo" aria-hidden="true" />
      </div>
    </div>
  );
}
