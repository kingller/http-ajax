"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformResponse = void 0;
var parse_headers_1 = require("./parse-headers");
var response_data_1 = require("./response-data");
function transformResponse(_a) {
    var response = _a.response, options = _a.options, xhr = _a.xhr, statusField = _a.statusField;
    if (options && options.transformResponse) {
        var responseHeaders = xhr ? (0, parse_headers_1.parseHeaders)(xhr.getAllResponseHeaders()) : undefined;
        var data = (0, response_data_1.getResponseData)({ response: response, statusField: statusField });
        data = options.transformResponse(data, responseHeaders);
        response = (0, response_data_1.setResponseData)({ response: response, data: data, statusField: statusField });
    }
    return response;
}
exports.transformResponse = transformResponse;
