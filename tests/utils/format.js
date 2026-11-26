/**
 * Escapa los caracteres especiales de HTML para evitar que sean
 * interpretados como etiquetas o código HTML.
 *
 * @param {*} value Valor que se desea escapar.
 * @returns {string} Texto con los caracteres especiales escapados.
 */
export const escapeHTML = value =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

/**
 * Elimina las secuencias de escape ANSI utilizadas para aplicar
 * colores y formatos al texto de la terminal.
 *
 * @param {*} text Valor del cual se eliminarán las secuencias ANSI.
 * @returns {string} Texto sin secuencias de escape ANSI.
 */
export const stripANSI = text => String(text ?? '').replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');

/**
 * Formatea una fecha y hora de ejecución.
 *
 * @param {string|Date} date Fecha de ejecución.
 * @returns {string} Fecha y hora formateadas.
 */
export const formatDateTime = date => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-GT', {
        timeZone: 'America/Guatemala',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date(date));
};

/**
 * Formatea una duración expresada en milisegundos.
 *
 * @param {number} duration Duración en milisegundos.
 * @returns {string} Duración formateada.
 */
export const formatDuration = duration => {
    if (!Number.isFinite(duration)) return '';
    if (duration < 1000) return `${duration} ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)} s`;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(2);
    return `${minutes} min ${seconds} s`;
};
