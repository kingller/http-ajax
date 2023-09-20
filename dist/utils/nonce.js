"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNonce(appNonce) {
    var end = appNonce.length - 1;
    return appNonce.substring(2, end);
}
exports.default = getNonce;
