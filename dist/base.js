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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var browser_which_1 = __importDefault(require("browser-which"));
var promise_1 = require("./utils/promise");
var form_1 = require("./utils/form");
var catch_1 = require("./utils/catch");
var transform_response_1 = require("./utils/transform-response");
var url_1 = require("./utils/url");
var Ajax = __importStar(require("./interface"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createError(message, code, request, response) {
    var error = new Error(message);
    if (code) {
        error.errorCode = code;
    }
    error.request = request;
    error.response = response;
    error.isAjaxError = true;
    error.toJSON = function () {
        return {
            // Standard
            errorMsg: message,
            errorCode: code,
        };
    };
    return error;
}
var AjaxBase = /** @class */ (function () {
    function AjaxBase() {
        var _this = this;
        this._config = {
            noCache: false,
            statusField: 'result',
        };
        this.getConfig = function () {
            return _this._config;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.get = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS.get, url, params, options, false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.post = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS.post, url, params, options, false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.put = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS.put, url, params, options, false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.del = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS.del, url, params, options, false);
        };
        this.loadable = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS.get, url, params, options, true);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            post: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS.post, url, params, options, true);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            put: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS.put, url, params, options, true);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            del: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS.del, url, params, options, true);
            },
        };
        this.prefix = '/api';
        this.$loading = '$loading';
        /** 请求发送前 */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.beforeSend = function (props) { };
        /** 数据处理 */
        this.processData = function (params, options) {
            return params;
        };
        /** 参数处理 */
        this.processParams = function (_a) {
            var urlParams = _a.urlParams, params = _a.params, paramsInOptions = _a.paramsInOptions;
            return { urlParams: urlParams, params: params, paramsInOptions: paramsInOptions };
        };
        /** 去除 URL 中:params 格式参数后参数处理 */
        this.processParamsAfter = function (props) { };
        this.processResponse = function (response, props) {
            return response;
        };
        /** 私有变量，请勿使用 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._cache = {};
        /** 私有变量，请勿使用 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._cacheCancel = {};
        /** 将参数拼成 key1=val1&key2=val2 的格式 */
        this.fillQueryParams = function (_a) {
            var params = _a.params, encodeValue = _a.encodeValue;
            var array = [];
            var paramsKeys = Object.keys(params);
            for (var i = 0; i < paramsKeys.length; i++) {
                var key = paramsKeys[i];
                var value = '';
                if (typeof params[key] !== 'undefined' && params[key] !== null) {
                    if (params[key] instanceof Array) {
                        value = params[key].join(',');
                    }
                    else {
                        value = params[key];
                    }
                }
                if (encodeValue !== false) {
                    value = encodeURIComponent(value);
                }
                array.push("".concat(key, "=").concat(value));
            }
            array.sort();
            return array;
        };
        this.stringifyParams = function (_a) {
            var params = _a.params, paramsInOptions = _a.paramsInOptions, method = _a.method, encodeValue = _a.encodeValue, cache = _a.cache, processData = _a.processData;
            var requestBody;
            var queryParamsArray = [];
            var isNeedFormat = 
            // 如果调用方已经将参数序列化成字符串，直接返回
            // processData === false 直接返回
            // FormData 直接返回
            typeof params !== 'string' && (0, url_1.needFormatData)({ params: params, processData: processData });
            if (method === Ajax.METHODS.get) {
                if (isNeedFormat) {
                    // 对于 GET 请求，将参数拼成 key1=val1&key2=val2 的格式
                    if (params && typeof params === 'object') {
                        queryParamsArray = _this.fillQueryParams({ params: params, encodeValue: encodeValue });
                    }
                }
                else {
                    if (typeof params === 'string') {
                        queryParamsArray.push(params);
                    }
                    else {
                        requestBody = params;
                    }
                }
            }
            else {
                if (isNeedFormat) {
                    // requestBody 为 undefined 时，将其转为空字符串，避免 IE 下出现错误：invalid JSON, only supports object and array
                    // requestBody 为 null 时，将其转为空字符串，避免出现错误：invalid JSON, only supports object and array
                    requestBody = (typeof params !== 'undefined' && params !== null && JSON.stringify(params)) || '';
                }
                else {
                    requestBody = params;
                }
            }
            if (paramsInOptions) {
                if (typeof paramsInOptions === 'object') {
                    // 将参数拼成 key1=val1&key2=val2 的格式
                    queryParamsArray.push.apply(queryParamsArray, _this.fillQueryParams({ params: paramsInOptions, encodeValue: encodeValue }));
                }
                else {
                    queryParamsArray.push(paramsInOptions);
                }
            }
            if (params && paramsInOptions) {
                queryParamsArray.sort();
            }
            if (_this._config.noCache) {
                if (!cache) {
                    queryParamsArray.push("_v=".concat(Math.floor(Math.random() * 1000000)));
                }
            }
            return {
                requestBody: requestBody,
                queryParams: queryParamsArray.join('&'),
            };
        };
        /** 配置 */
        this.config = function (options) {
            if (options === void 0) { options = {}; }
            if (typeof options.noCache !== 'undefined') {
                console.warn('http-ajax: `noCache` will be deprecated');
            }
            var _loop_1 = function (key) {
                if (Object.prototype.hasOwnProperty.call(options, key)) {
                    var value_1 = options[key];
                    if (key === 'prefix' ||
                        key === 'onSuccess' ||
                        key === 'onError' ||
                        key === 'onSessionExpired' ||
                        key === 'beforeSend' ||
                        key === 'processData' ||
                        key === 'responseEnd' ||
                        key === 'processError' ||
                        key === 'catchError' ||
                        key === 'transformRequest') {
                        if (key === 'prefix') {
                            if (typeof value_1 === 'string') {
                                _this.prefix = value_1;
                            }
                        }
                        else {
                            if (typeof value_1 === 'function') {
                                if (key === 'beforeSend') {
                                    var beforeSend_1 = _this.beforeSend;
                                    _this[key] = function (props) {
                                        return (0, promise_1.promisify)(value_1(props)).then(function () {
                                            return beforeSend_1(props);
                                        });
                                    };
                                }
                                else if (key === 'processData') {
                                    var processData_1 = _this.processData;
                                    _this[key] = function (params, props) {
                                        var processedParams = value_1(params, props);
                                        return processData_1(processedParams, props);
                                    };
                                }
                                else if (key === 'responseEnd') {
                                    var responseEnd_1 = _this.responseEnd;
                                    _this[key] = function (xhr, _opts, props) {
                                        value_1(xhr, _opts, props);
                                        responseEnd_1(xhr, _opts, props);
                                    };
                                }
                                else {
                                    _this[key] = value_1;
                                }
                            }
                        }
                    }
                    else {
                        _this._config[key] = value_1;
                    }
                }
            };
            for (var key in options) {
                _loop_1(key);
            }
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.onSuccess = function (xhr, _a) {
        var response = _a.response, options = _a.options, resolve = _a.resolve, reject = _a.reject;
        var statusField = this._config.statusField;
        if (response[statusField]) {
            resolve(response.data);
        }
        else if (response[statusField] === false) {
            reject(response);
        }
        else {
            resolve(response);
        }
    };
    /** 添加默认 AJAX 错误处理程序（请勿使用，内部扩展插件使用，外部请使用 onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    AjaxBase.prototype.processErrorResponse = function (xhr, _opts) { };
    /** 添加默认 AJAX 错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.onError = function (xhr, _opts) {
        _opts.reject(xhr);
    };
    /** 捕获错误 */
    AjaxBase.prototype.catchError = function (props) {
        var errorCode = props.errorCode, errorMsg = props.errorMsg, remark = props.remark, type = props.type;
        if (type === 'uncaught') {
            throw new Error("".concat(errorCode || '', " ").concat(errorMsg, " ").concat(remark || ''));
        }
    };
    AjaxBase.prototype.setLoading = function (loadingName) {
        this.$loading = loadingName;
    };
    /** 移除缓存的 cancel 请求 */
    AjaxBase.prototype.removeCacheCancel = function (token) {
        if (this._cacheCancel[token]) {
            delete this._cacheCancel[token];
        }
    };
    AjaxBase.prototype.getProcessedParams = function (method, url, params, options, reject
    /* eslint-disable @typescript-eslint/indent */
    ) {
        if (options === void 0) { options = {}; }
        /* eslint-enable @typescript-eslint/indent */
        if (options.processData !== false) {
            params = this.processData(params, { method: method, url: url, options: options, reject: reject });
        }
        var processedUrlParams = (0, url_1.splitUrlParams)({
            url: url,
            params: params,
            paramsInOptions: options.params,
            processData: options.processData,
        });
        var urlParams = processedUrlParams.urlParams;
        var optionsParams = processedUrlParams.paramsInOptions;
        params = processedUrlParams.params;
        var processedParams = this.processParams({
            urlParams: urlParams,
            params: params,
            paramsInOptions: optionsParams,
            method: method,
            url: url,
            options: options,
            reject: reject,
            processData: options.processData,
        });
        urlParams = processedParams.urlParams;
        params = processedParams.params;
        var paramsInOptions = processedParams.paramsInOptions;
        if (urlParams) {
            var processedValue = (0, url_1.processParamsInUrl)(url, urlParams);
            url = processedValue.url;
        }
        var _a = this.stringifyParams({
            params: params,
            paramsInOptions: paramsInOptions,
            method: method,
            cache: options.cache,
            processData: options.processData,
        }), requestBody = _a.requestBody, queryParams = _a.queryParams;
        return {
            url: url,
            requestBody: requestBody,
            queryParams: queryParams,
            params: params,
            urlParams: urlParams,
            paramsInOptions: paramsInOptions,
        };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    AjaxBase.prototype.responseEnd = function (xhr, _opts, _a) {
        var boolean = _a.success;
    };
    AjaxBase.prototype.sendRequest = function (
    /* eslint-disable @typescript-eslint/indent */
    props, 
    /* eslint-enable @typescript-eslint/indent */
    url, params, loading, resolve, reject, onSessionExpired, options, cancelExecutor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        var method;
        var _retryTimes = 0;
        /** 链路追踪 ID */
        var xCorrelationID = '';
        if (typeof props === 'object') {
            method = props.method;
            url = props.url;
            params = props.params;
            loading = props.loading;
            resolve = props.resolve;
            reject = props.reject;
            options = props.options;
            cancelExecutor = props.cancelExecutor;
            if (props.onSessionExpired) {
                onSessionExpired = props.onSessionExpired;
            }
            if (props.xCorrelationID) {
                xCorrelationID = props.xCorrelationID;
            }
            if (typeof props._retryTimes === 'number') {
                _retryTimes = props._retryTimes;
            }
        }
        else {
            method = props;
        }
        if (!onSessionExpired) {
            onSessionExpired = this.onSessionExpired;
        }
        if (!options) {
            options = {};
        }
        if (this.transformRequest) {
            var transformed = this.transformRequest({
                method: method,
                url: url,
                params: params,
                options: options,
                loading: loading,
            });
            if (transformed) {
                method = (_a = transformed.method) !== null && _a !== void 0 ? _a : method;
                url = (_b = transformed.url) !== null && _b !== void 0 ? _b : url;
                params = (_c = transformed.params) !== null && _c !== void 0 ? _c : params;
                options = (_d = transformed.options) !== null && _d !== void 0 ? _d : options;
                loading = (_e = transformed.loading) !== null && _e !== void 0 ? _e : loading;
            }
        }
        var _opts = {
            method: method,
            url: url,
            params: params,
            loading: loading,
            resolve: resolve,
            reject: reject,
            onSessionExpired: onSessionExpired,
            options: options,
            cancelExecutor: cancelExecutor,
            // 链路追踪 ID
            xCorrelationID: xCorrelationID,
            // 请求开始时间
            startTime: new Date().getTime(),
            /**
             * @private 第几次重试（内部变量）
             */
            _retryTimes: _retryTimes,
        };
        var _cancel = false;
        if (cancelExecutor) {
            cancelExecutor(function () {
                _cancel = true;
            });
        }
        var beforeSendPromise = this.beforeSend({ method: method, url: url, params: params, options: options, loading: loading });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (0, promise_1.promisify)(beforeSendPromise)
            .then(function () {
            if (_cancel) {
                // aborted before send
                reject(createError('Request aborted', Ajax.CODE.CANCEL));
                _this.responseEnd(undefined, _opts, { success: false });
                return;
            }
            if (options.onData) {
                options.json = false;
            }
            var processedValue = _this.getProcessedParams(method, url, params, options, reject);
            var processParamsAfterPromise = _this.processParamsAfter({
                params: processedValue.params,
                paramsInOptions: processedValue.paramsInOptions,
                method: method,
                url: url,
                options: options,
                reject: reject,
                processData: options.processData,
            });
            return (0, promise_1.promisify)(processParamsAfterPromise).then(function () {
                if (_cancel) {
                    // aborted before send
                    reject(createError('Request aborted', Ajax.CODE.CANCEL));
                    _this.responseEnd(undefined, _opts, { success: false });
                    return;
                }
                url = processedValue.url;
                var queryParams = processedValue.queryParams, requestBody = processedValue.requestBody;
                if (queryParams) {
                    url = "".concat(url, "?").concat(queryParams);
                }
                if (options.cache && _this._cache[url] !== undefined) {
                    _this.responseEnd(undefined, _opts, { success: true });
                    _this.onSuccess(undefined, {
                        response: _this._cache[url],
                        options: options,
                        resolve: resolve,
                        reject: reject,
                        method: _opts.method,
                        url: _opts.url,
                        params: _opts.params,
                    });
                    return;
                }
                var xhr = new XMLHttpRequest();
                var chunked = [];
                var ajaxThis = _this;
                xhr.onreadystatechange = function () {
                    var _a;
                    var _this = this;
                    if (options.onData) {
                        if (this.readyState === 3 || this.readyState === 4) {
                            // 因为请求响应较快时，会出现一次返回多个块，所以使用取出数组新增项的做法
                            if (this.response) {
                                var chunks = this.response.match(/<chunk>([\s\S]*?)<\/chunk>/g);
                                if (chunks) {
                                    chunks = chunks.map(function (item) { return item.replace(/<\/?chunk>/g, ''); });
                                    // 取出新增的数据
                                    var data = chunks.slice(chunked.length);
                                    data.forEach(function (item) {
                                        try {
                                            options.onData(JSON.parse(item));
                                        }
                                        catch (e) {
                                            options.onData(item);
                                        }
                                    });
                                    chunked = chunks;
                                }
                                else {
                                    var consoleMethod = this.readyState === 4 ? 'error' : 'warn';
                                    // eslint-disable-next-line no-console
                                    if (console && console[consoleMethod]) {
                                        // eslint-disable-next-line no-console
                                        console[consoleMethod]("".concat(method, " ").concat(url, " Incorrect response"));
                                    }
                                }
                            }
                        }
                    }
                    if (this.readyState !== 4)
                        return;
                    if (options && options.cancelToken) {
                        // 请求完成，删除缓存的 cancel
                        ajaxThis.removeCacheCancel(options.cancelToken);
                    }
                    if (this.status === 200 || this.status === 201) {
                        var res = void 0;
                        var statusField = ajaxThis._config.statusField;
                        if ((xhr.responseType && xhr.responseType !== 'json') || options.json === false) {
                            res = (_a = {},
                                _a[statusField] = true,
                                _a.data = this.response || this.responseText,
                                _a);
                        }
                        else {
                            // IE9 下 responseType 为 json 时，response 的值为 undefined，返回值需去 responseText 取
                            // 其它浏览器 responseType 为 json 时，取 response
                            if (xhr.responseType === 'json' && typeof this.response !== 'undefined') {
                                res = this.response;
                            }
                            else {
                                res = JSON.parse(this.response || this.responseText || '{}');
                            }
                        }
                        res = ajaxThis.processResponse(res, {
                            xhr: xhr,
                            method: method,
                            url: url,
                            params: _opts.params,
                            options: options,
                            resolve: resolve,
                            reject: reject,
                            xCorrelationID: _opts.xCorrelationID,
                        });
                        res = (0, transform_response_1.transformResponse)({ response: res, options: options, xhr: xhr, statusField: statusField });
                        if (options.cache) {
                            ajaxThis._cache[url] = res;
                        }
                        ajaxThis.responseEnd(xhr, _opts, { success: true });
                        ajaxThis.onSuccess(xhr, {
                            response: res,
                            method: _opts.method,
                            url: _opts.url,
                            params: _opts.params,
                            options: options,
                            resolve: resolve,
                            reject: reject,
                            xCorrelationID: _opts.xCorrelationID,
                        });
                    }
                    else if (this.status === 204) {
                        ajaxThis.processResponse(null, {
                            xhr: xhr,
                            method: method,
                            url: url,
                            params: _opts.params,
                            options: options,
                            resolve: resolve,
                            reject: reject,
                            xCorrelationID: _opts.xCorrelationID,
                        });
                        ajaxThis.responseEnd(xhr, _opts, { success: true });
                        resolve(null);
                    }
                    else {
                        ajaxThis.responseEnd(xhr, _opts, { success: false });
                        // @ts-ignore
                        if (this.aborted) {
                            return;
                        }
                        var errorResponse = ajaxThis.processErrorResponse(this, _opts);
                        (0, promise_1.promisify)(errorResponse).then(function () {
                            ajaxThis.onError(_this, _opts);
                        });
                    }
                };
                xhr.open(method, (0, url_1.addPrefixToUrl)(url, ajaxThis.prefix, options.prefix));
                // xhr.responseType = 'json';
                if (options.responseType) {
                    xhr.responseType = options.responseType;
                }
                if ((!options.headers || typeof options.headers.token === 'undefined') && !options.simple) {
                    var token = '';
                    try {
                        token = window.localStorage.getItem('token') || '';
                    }
                    catch (e) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        console && console.error('Failed to get token from localStorage');
                    }
                    if (token) {
                        xhr.setRequestHeader('token', token);
                    }
                }
                var isContentTypeExist = false;
                var isCacheControlExist = false;
                var isXCorrelationIDExist = false;
                if (options.headers) {
                    for (var _i = 0, _a = Object.keys(options.headers); _i < _a.length; _i++) {
                        var k = _a[_i];
                        var v = options.headers[k];
                        var lowerCaseKey = k.toLowerCase();
                        if (lowerCaseKey === 'content-type') {
                            isContentTypeExist = true;
                            // 支持不设置 Content-Type
                            if (v) {
                                xhr.setRequestHeader(k, v);
                            }
                        }
                        else {
                            if (lowerCaseKey === 'cache-control') {
                                isCacheControlExist = true;
                            }
                            else {
                                if (lowerCaseKey === 'x-correlation-id' || k === 'token') {
                                    if (lowerCaseKey === 'x-correlation-id') {
                                        isXCorrelationIDExist = true;
                                        _opts.xCorrelationID = v;
                                    }
                                    if (!v) {
                                        continue;
                                    }
                                }
                            }
                            xhr.setRequestHeader(k, v);
                        }
                    }
                }
                if (!options.simple) {
                    if (!isXCorrelationIDExist) {
                        if (
                        // 重发的请求和前面的请求使用同样的 xCorrelationID，不需要生成新的 id
                        !_opts.xCorrelationID) {
                            _opts.xCorrelationID = (0, uuid_1.v4)();
                        }
                        xhr.setRequestHeader('X-Correlation-ID', _opts.xCorrelationID);
                    }
                    if (!isContentTypeExist && !(0, form_1.isFormData)(params) && (!options || options.encrypt !== 'all')) {
                        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                    }
                    if (!isCacheControlExist && browser_which_1.default.ie) {
                        xhr.setRequestHeader('Cache-Control', 'no-cache');
                        xhr.setRequestHeader('Pragma', 'no-cache');
                    }
                }
                if (options.onProgress) {
                    xhr.upload.onprogress = options.onProgress;
                }
                if (typeof options.timeout === 'number') {
                    xhr.timeout = options.timeout;
                }
                // prettier-ignore
                xhr.send(requestBody);
                if (cancelExecutor) {
                    cancelExecutor(function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            return;
                        }
                        reject(createError('Request aborted', Ajax.CODE.CANCEL, xhr));
                        // @ts-ignore
                        xhr.aborted = true;
                        xhr.abort();
                    });
                }
            });
        })
            .catch(function (e) {
            _this.responseEnd(undefined, _opts, { success: false });
            reject(e);
            (0, catch_1.catchAjaxError)({
                e: e,
                method: method,
                url: url,
                params: params,
                callback: _this.catchError,
                type: 'log',
                xCorrelationID: _opts.xCorrelationID,
                options: options,
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.request = function (method, url, params, options, loading) {
        var _this = this;
        var cancel;
        var promise;
        var cancelExecutor = function (c) {
            // An executor function receives a cancel function as a parameter
            cancel = c;
            if (promise) {
                promise.cancel = cancel;
            }
            // 如果是再次发送的请求，前一请求缓存已从_cacheCancel 清除，这里需要重新设置
            if (options && options.cancelToken && promise && !_this._cacheCancel[options.cancelToken]) {
                _this._cacheCancel[options.cancelToken] = promise;
            }
        };
        promise = new Promise(function (resolve, reject) {
            // prettier-ignore
            _this.sendRequest(method, url, params, loading, resolve, reject, _this.onSessionExpired, options, cancelExecutor);
        });
        promise.cancel = cancel;
        if (options && options.cancelToken) {
            // 传入 cancelToken 的话就缓存 cancel, 用来取消请求
            this.cancel(options.cancelToken);
            this._cacheCancel[options.cancelToken] = promise;
        }
        return promise;
    };
    /** session 过期回调 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.onSessionExpired = function (error, props) {
        var reject = props.reject;
        reject(error);
    };
    AjaxBase.prototype.getCacheKey = function (url, params, options) {
        var method = Ajax.METHODS.get;
        var _options = __assign(__assign({}, options), { cache: true });
        var processedValue = this.getProcessedParams(method, url, params, _options);
        url = processedValue.url;
        params = processedValue.queryParams;
        return params ? "".concat(url, "?").concat(params) : url;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.getCache = function (url, params, options) {
        var key = this.getCacheKey(url, params, options);
        return this._cache[key];
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.getAllCache = function () {
        return this._cache;
    };
    AjaxBase.prototype.removeCache = function (url, params, options) {
        var key = this.getCacheKey(url, params, options);
        delete this._cache[key];
    };
    AjaxBase.prototype.clearCacheByUrl = function (url) {
        var keys = Object.keys(this._cache);
        // 匹配 url 或者以 url? 开头的key
        var urlPattern = new RegExp("^".concat(url, "(\\?|$)"));
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (urlPattern.test(key)) {
                delete this._cache[key];
            }
        }
    };
    AjaxBase.prototype.clearCache = function () {
        this._cache = {};
    };
    AjaxBase.prototype.clear = function () {
        this.clearCache();
    };
    /** 生成 cancel token */
    AjaxBase.prototype.cancelToken = function () {
        return "".concat(new Date().getTime(), "_").concat(Math.random());
    };
    /** cancel 请求 */
    AjaxBase.prototype.cancel = function (token) {
        if (!token) {
            return;
        }
        var promise = this._cacheCancel[token];
        if (!promise) {
            return;
        }
        this.removeCacheCancel(token);
        promise.cancel();
    };
    /** 判断错误类型是否为取消请求 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.isCancel = function (error) {
        if (error && typeof error === 'object' && error.errorCode === Ajax.CODE.CANCEL) {
            return true;
        }
        return false;
    };
    return AjaxBase;
}());
exports.default = AjaxBase;
