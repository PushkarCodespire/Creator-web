// Custom debounce utility to avoid external dependencies
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout | null = null;

    const debounced = function (this: any, ...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    } as T & { cancel: () => void };

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
}
