// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFormData(params: any): boolean {
    return Object.prototype.toString.call(params) === '[object FormData]';
}
