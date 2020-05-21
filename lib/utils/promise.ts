// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function promisify<T = any>(value: any): Promise<T> {
    if (!value || typeof value.then !== 'function') {
        value = Promise.resolve(value);
    }
    return value;
}
