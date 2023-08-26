export function def<T>(f: () => T, b: T): T {
    try {
        return f();
    } catch (error) {
        return b;
    }
}