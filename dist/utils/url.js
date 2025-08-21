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
exports.addPrefixToUrl = addPrefixToUrl;
exports.processParamsInUrl = processParamsInUrl;
exports.needFormatData = needFormatData;
exports.splitUrlParams = splitUrlParams;
var form_1 = require("./form");
function addPrefixToUrl(url, globalPrefix, optionsPrefix) {
    if (typeof optionsPrefix === 'string') {
        return "".concat(optionsPrefix).concat(url);
    }
    if (/^https?:\/\//.test(url)) {
        return url;
    }
    return "".concat(globalPrefix).concat(url);
}
function getParamsInUrl(url) {
    var modules = url.split('/');
    var params = [];
    modules.forEach(function (m) {
        if (m && /^:\w/.test(m)) {
            var paramName = m.match(/^:(.*)$/)[1];
            params.push(paramName);
        }
    });
    return params;
}
function fillParamsInUrl(url, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
urlParams) {
    var modules = url.split('/');
    var urlModules = modules.map(function (m) {
        if (m && /^:\w/.test(m)) {
            var paramName = m.match(/^:(.*)$/)[1];
            return encodeURIComponent(urlParams[paramName]);
        }
        return m;
    });
    return {
        url: urlModules.join('/'),
    };
}
function processParamsInUrl(url, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
urlParams) {
    if (url && urlParams) {
        var matchQueryString = url.match(/(.*?)\?(.*)/);
        var queryStringInUrl = '';
        if (matchQueryString) {
            url = matchQueryString[1];
            queryStringInUrl = matchQueryString[2];
        }
        var filledUrl = fillParamsInUrl(url, urlParams).url;
        if (queryStringInUrl) {
            filledUrl = "".concat(filledUrl, "?").concat(queryStringInUrl);
        }
        return {
            url: filledUrl,
        };
    }
    return {
        url: url,
    };
}
function needFormatData(_a) {
    var params = _a.params, processData = _a.processData;
    return processData !== false && !(0, form_1.isFormData)(params);
}
function splitUrlParams(_a) {
    var url = _a.url, params = _a.params, paramsInOptions = _a.paramsInOptions, processData = _a.processData;
    var urlParamNames = getParamsInUrl(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var urlParams = {};
    if (!urlParamNames ||
        !urlParamNames.length ||
        ((!params || typeof params !== 'object') && (!paramsInOptions || typeof paramsInOptions !== 'object'))) {
        return {
            urlParams: urlParams,
            params: params,
            paramsInOptions: paramsInOptions,
        };
    }
    var findInParams = false;
    if (params && typeof params === 'object' && needFormatData({ params: params, processData: processData })) {
        params = __assign({}, params);
        findInParams = true;
    }
    var findInOptions = false;
    if (paramsInOptions && typeof paramsInOptions === 'object') {
        paramsInOptions = __assign({}, paramsInOptions);
        findInOptions = true;
    }
    for (var _i = 0, urlParamNames_1 = urlParamNames; _i < urlParamNames_1.length; _i++) {
        var paramName = urlParamNames_1[_i];
        if (findInOptions) {
            if (paramName in paramsInOptions) {
                urlParams[paramName] = paramsInOptions[paramName];
                delete paramsInOptions[paramName];
                continue;
            }
        }
        if (findInParams) {
            if (paramName in params) {
                urlParams[paramName] = params[paramName];
                delete params[paramName];
            }
        }
    }
    return {
        urlParams: Object.keys(urlParams).length > 0 ? urlParams : null,
        params: params,
        paramsInOptions: paramsInOptions,
    };
}
