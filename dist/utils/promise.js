"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promisify = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function promisify(value) {
    if (!value || typeof value.then !== 'function') {
        value = Promise.resolve(value);
    }
    return value;
}
exports.promisify = promisify;
