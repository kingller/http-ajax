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
exports.processParamsInUrl = exports.addPrefixToUrl = void 0;
var form_1 = require("./form");
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
function fillParamsInUrl(url, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
params
/* eslint-disable @typescript-eslint/indent */
) {
    /* eslint-enable @typescript-eslint/indent */
    params = __assign({}, params);
    var modules = url.split('/');
    var urlModules = modules.map(function (m) {
        if (m && /^:\w/.test(m)) {
            var paramName = m.match(/^:(.*)$/)[1];
            var value = encodeURIComponent(params[paramName]);
            delete params[paramName];
            return value;
        }
        return m;
    });
    return {
        url: urlModules.join('/'),
        params: params,
    };
}
function processParamsInUrl(url, params
/* eslint-disable @typescript-eslint/indent */
) {
    /* eslint-enable @typescript-eslint/indent */
    if (url && /(^|\/):\w/.test(url) && params && typeof params === 'object' && !form_1.isFormData(params)) {
        var matchQueryString = url.match(/(.*?)\?(.*)/);
        var queryStringInUrl = '';
        if (matchQueryString) {
            url = matchQueryString[1];
            queryStringInUrl = matchQueryString[2];
        }
        var _a = fillParamsInUrl(url, params), filledUrl = _a.url, restParams = _a.params;
        if (queryStringInUrl) {
            filledUrl = filledUrl + "?" + queryStringInUrl;
        }
        return {
            url: filledUrl,
            params: restParams,
        };
    }
    return {
        url: url,
        params: params,
    };
}
exports.processParamsInUrl = processParamsInUrl;
