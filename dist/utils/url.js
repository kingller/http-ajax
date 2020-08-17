"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPrefixToUrl = void 0;
function addPrefixToUrl(url, globalPrefix, optionsPrefix) {
    if (typeof optionsPrefix === 'string') {
        return "" + optionsPrefix + url;
    }
    if (/^https?:\/\//.test(url)) {
        return url;
    }
    return "" + globalPrefix + url;
}
exports.addPrefixToUrl = addPrefixToUrl;
