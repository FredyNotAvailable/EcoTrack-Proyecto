import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que hace scroll al inicio de la página cuando cambia la ruta.
 * Si la URL tiene un hash (#seccion), hace scroll a ese elemento en su lugar.
 */
export const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Si hay un hash, hacer scroll al elemento correspondiente
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100); // Pequeño delay para asegurar que el DOM esté listo
        } else {
            // Sin hash, scroll al inicio
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [pathname, hash]);

    return null;
};
