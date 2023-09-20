if (FormData && !FormData.prototype.forEach) {
    const { append } = FormData.prototype;

    function polyfillAppend(name: string, value: string | Blob): void;
    function polyfillAppend(name: string, value: string): void;
    function polyfillAppend(name: string, blobValue: Blob, filename?: string): void;
    // eslint-disable-next-line no-inner-declarations
    function polyfillAppend(name: string, value: string | Blob, filename?: string): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        append.bind(this)(name, value as any, filename);
        if (!this._$data) {
            this._$data = {};
        }
        this._$data[filename || name] = value;
    }
    FormData.prototype.append = polyfillAppend;

    FormData.prototype.forEach = function (
        callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thisArg?: any
    ): void {
        if (this._$data) {
            for (const key in this._$data) {
                if (Object.prototype.hasOwnProperty.call(this._$data, key)) {
                    const value = this._$data[key] as FormDataEntryValue;
                    callbackfn(value, key, this);
                }
            }
        }
    };
}
