if (FormData && !FormData.prototype.forEach) {
    var append_1 = FormData.prototype.append;
    // eslint-disable-next-line no-inner-declarations
    function polyfillAppend(name, value, filename) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        append_1.bind(this)(name, value, filename);
        if (!this._$data) {
            this._$data = {};
        }
        this._$data[filename || name] = value;
    }
    FormData.prototype.append = polyfillAppend;
    FormData.prototype.forEach = function (callbackfn, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg) {
        if (this._$data) {
            for (var key in this._$data) {
                if (Object.prototype.hasOwnProperty.call(this._$data, key)) {
                    var value = this._$data[key];
                    callbackfn(value, key, this);
                }
            }
        }
    };
}
