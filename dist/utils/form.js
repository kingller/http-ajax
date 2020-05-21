"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFormData = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFormData(params) {
    return Object.prototype.toString.call(params) === '[object FormData]';
}
exports.isFormData = isFormData;
