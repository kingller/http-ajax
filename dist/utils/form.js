"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFormData = isFormData;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFormData(params) {
    return Object.prototype.toString.call(params) === '[object FormData]';
}
