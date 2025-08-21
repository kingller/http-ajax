"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDeep = cloneDeep;
function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}
