"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
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
exports.isOpenApi = isOpenApi;
exports.getResponseData = getResponseData;
exports.setResponseData = setResponseData;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _isOpenApi(response) {
    return response.code !== undefined && response.details !== undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isOpenApi(response) {
    if (response && typeof response === 'object') {
        return _isOpenApi(response);
    }
    return false;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getResponseData(_a) {
    var response = _a.response, statusField = _a.statusField;
    if (response && typeof response === 'object') {
        if (_isOpenApi(response)) {
            return response.details;
        }
        if (response[statusField] !== undefined) {
            return response.data;
        }
    }
    return response;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setResponseData(_a) {
    var response = _a.response, data = _a.data, statusField = _a.statusField;
    if (response && typeof response === 'object') {
        if (_isOpenApi(response)) {
            return __assign(__assign({}, response), { details: data });
        }
        if (response[statusField] !== undefined) {
            return __assign(__assign({}, response), { data: data });
        }
    }
    return data;
}
