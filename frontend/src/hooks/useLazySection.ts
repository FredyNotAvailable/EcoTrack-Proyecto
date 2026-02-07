import { useEffect, useRef, useState } from 'react';

interface UseLazySectionOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook para lazy loading de secciones usando Intersection Observer.
 * Mejora el rendimiento inicial cargando secciones solo cuando están cerca del viewport.
 */
export const useLazySection = ({
    threshold = 0.1,
    rootMargin = '100px',
    triggerOnce = true,
}: UseLazySectionOptions = {}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Si ya es visible y triggerOnce está activo, no necesitamos observer
        if (isVisible && triggerOnce) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.disconnect();
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce, isVisible]);

    return { ref, isVisible };
};
