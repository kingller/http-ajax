"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformData = void 0;
var parse_headers_1 = require("./parse-headers");
function transformData(_a) {
    var response = _a.response, options = _a.options, xhr = _a.xhr, statusField = _a.statusField;
    if (options && options.transformData) {
        var responseHeaders = xhr ? parse_headers_1.parseHeaders(xhr.getAllResponseHeaders()) : undefined;
        if (response && typeof response === 'object' && typeof response[statusField] !== 'undefined') {
            response.data = options.transformData(response.data, responseHeaders);
        }
        else {
            response = options.transformData(response, responseHeaders);
        }
    }
    return response;
}
exports.transformData = transformData;
