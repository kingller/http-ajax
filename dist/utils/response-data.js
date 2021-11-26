"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setResponseData = exports.getResponseData = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getResponseData(_a) {
    var response = _a.response, statusField = _a.statusField;
    if (typeof response === 'object') {
        if (typeof response.apiVersion !== 'undefined') {
            return response.details;
        }
        if (typeof response[statusField] !== 'undefined') {
            return response.data;
        }
    }
    return response;
}
exports.getResponseData = getResponseData;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setResponseData(_a) {
    var response = _a.response, data = _a.data, statusField = _a.statusField;
    if (typeof response === 'object') {
        if (typeof response.apiVersion !== 'undefined') {
            return __assign(__assign({}, response), { details: data });
        }
        if (typeof response[statusField] !== 'undefined') {
            return __assign(__assign({}, response), { data: data });
        }
    }
    return data;
}
exports.setResponseData = setResponseData;
