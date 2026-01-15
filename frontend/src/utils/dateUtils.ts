export const getTimeAgo = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} día${days > 1 ? 's' : ''}`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} sem`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};
