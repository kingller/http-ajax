"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHeaders = exports.trim = void 0;
function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
}
exports.trim = trim;
function parseHeaders(headers
/* eslint-disable @typescript-eslint/indent */
) {
    /* eslint-enable @typescript-eslint/indent */
    var headerMap = {};
    var key;
    var val;
    var i;
    if (!headers) {
        return headerMap;
    }
    // Convert the header string into an array
    // of individual headers
    var arr = headers.trim().split(/[\r\n]+/);
    arr.forEach(function (line) {
        i = line.indexOf(':');
        key = trim(line.substr(0, i)).toLowerCase();
        val = trim(line.substr(i + 1));
        if (key) {
            if (headerMap[key]) {
                return;
            }
            if (key === 'set-cookie') {
                headerMap[key] = (headerMap[key] ? headerMap[key] : []).concat([val]);
            }
            else {
                headerMap[key] = headerMap[key] ? headerMap[key] + ", " + val : val;
            }
        }
    });
    return headerMap;
}
exports.parseHeaders = parseHeaders;
