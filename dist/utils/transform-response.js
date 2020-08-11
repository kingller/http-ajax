"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformResponse = void 0;
var parse_headers_1 = require("./parse-headers");
function transformResponse(_a) {
    var response = _a.response, options = _a.options, xhr = _a.xhr, statusField = _a.statusField;
    if (options && options.transformResponse) {
        var responseHeaders = xhr ? parse_headers_1.parseHeaders(xhr.getAllResponseHeaders()) : undefined;
        if (response && typeof response === 'object' && typeof response[statusField] !== 'undefined') {
            response.data = options.transformResponse(response.data, responseHeaders);
        }
        else {
            response = options.transformResponse(response, responseHeaders);
        }
    }
    return response;
}
exports.transformResponse = transformResponse;
