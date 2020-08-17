'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var v4_1 = __importDefault(require("uuid/v4"));
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
            return _this.request(Ajax.METHODS['get'], url, params, options, false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.post = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS['post'], url, params, options, false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.put = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS['put'], url, params, options, false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.del = function (url, params, options) {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return _this.request(Ajax.METHODS['del'], url, params, options, false);
        };
        this.loadable = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            get: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS['get'], url, params, options, true);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            post: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS['post'], url, params, options, true);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            put: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS['put'], url, params, options, true);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            del: function (url, params, options) {
                // eslint-disable-next-line  @typescript-eslint/no-use-before-define
                return _this.request(Ajax.METHODS['del'], url, params, options, true);
            },
        };
        this.prefix = '/api';
        this.$loading = '$loading';
        /** 请求发送前 */
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.beforeSend = function (props) { };
        /** 数据处理 */
        this.processData = function (params, props) {
            return params;
        };
        this.processResponse = function (response, props) {
            return response;
        };
        /** 私有变量，请勿使用 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._cache = {};
        /** 私有变量，请勿使用 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._cacheCancel = {};
        this.stringifyParams = function (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params, method, options) {
            //如果调用方已经将参数序列化成字符串，直接返回
            if (typeof params === 'string')
                return params;
            //对于非GET请求，直接序列化该参数对象
            //requestBody为undefined时，将其转为空字符串，避免IE下出现错误：invalid JSON, only supports object and array
            //requestBody为null时，将其转为空字符串，避免出现错误：invalid JSON, only supports object and array
            if (method !== Ajax.METHODS.get)
                return (params !== null && JSON.stringify(params)) || '';
            //对于GET请求，将参数拼成key1=val1&key2=val2的格式
            var array = [];
            if (params && typeof params === 'object') {
                var paramsKeys = Object.keys(params).sort();
                for (var i = 0; i < paramsKeys.length; i++) {
                    var key = paramsKeys[i];
                    /* eslint-disable @typescript-eslint/indent */
                    var value = params[key] === null || params[key] === undefined
                        ? ''
                        : params[key] instanceof Array
                            ? params[key].join(',')
                            : params[key];
                    /* eslint-enable @typescript-eslint/indent */
                    if (!options || options.encodeValue !== false) {
                        value = encodeURIComponent(value);
                    }
                    array.push(key + "=" + value);
                }
            }
            if (_this._config.noCache) {
                if (!options || !options.cache) {
                    array.push("_v=" + Math.floor(Math.random() * 1000000));
                }
            }
            return array.join('&');
        };
        /** 配置 */
        this.config = function (options) {
            if (options === void 0) { options = {}; }
            if (typeof options.noCache !== 'undefined') {
                console.warn('http-ajax: `noCache` will be deprecated in next version `4.0.0`');
            }
            for (var key in options) {
                var value = options[key];
                if (key === 'prefix' ||
                    key === 'onSuccess' ||
                    key === 'onError' ||
                    key === 'onSessionExpired' ||
                    key === 'getLoading' ||
                    key === 'beforeSend' ||
                    key === 'processData' ||
                    key === 'catchError') {
                    if (key === 'prefix') {
                        if (typeof value === 'string') {
                            _this.prefix = value;
                        }
                    }
                    else {
                        if (typeof value === 'function') {
                            _this[key] = value;
                        }
                    }
                }
                else {
                    _this._config[key] = value;
                }
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
    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    AjaxBase.prototype.processErrorResponse = function (xhr, _opts) { };
    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.onError = function (xhr, _opts) {
        _opts.reject(xhr);
    };
    /** 捕获错误 */
    AjaxBase.prototype.catchError = function (props) {
        var errorCode = props.errorCode, errorMsg = props.errorMsg, remark = props.remark, type = props.type;
        if (type === 'uncaught') {
            throw new Error((errorCode || '') + " " + errorMsg + " " + (remark || ''));
        }
    };
    AjaxBase.prototype.setLoading = function (loadingName) {
        this.$loading = loadingName;
    };
    /** 加载进度条 */
    AjaxBase.prototype.getLoading = function (options) {
        // @ts-ignore
        if (options.loadingName && window[options.loadingName]) {
            // @ts-ignore
            return window[options.loadingName];
        }
        if (options.context && options.context.loading) {
            return options.context.loading;
        }
        // @ts-ignore
        return window[this.$loading];
    };
    /** 移除缓存的cancel请求 */
    AjaxBase.prototype.removeCacheCancel = function (token) {
        this._cacheCancel[token] && delete this._cacheCancel[token];
    };
    AjaxBase.prototype.getProcessedParams = function (method, url, params, options, reject) {
        if (options === void 0) { options = {}; }
        if (options.processData !== false) {
            params = this.processData(params, { method: method, url: url, options: options, reject: reject });
            if (!form_1.isFormData(params)) {
                params = this.stringifyParams(params, method, options);
            }
        }
        return params;
    };
    AjaxBase.prototype.sendRequest = function (
    /* eslint-disable @typescript-eslint/indent */
    props, 
    /* eslint-enable @typescript-eslint/indent */
    url, params, loading, resolve, reject, onSessionExpired, options, cancelExecutor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        var _this = this;
        var method;
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
        }
        else {
            method = props;
        }
        if (!onSessionExpired) {
            onSessionExpired = this.onSessionExpired;
        }
        var _opts = { method: method, url: url, params: params, loading: loading, resolve: resolve, reject: reject, onSessionExpired: onSessionExpired, options: options, cancelExecutor: cancelExecutor };
        !options && (options = {});
        var _cancel = false;
        cancelExecutor &&
            cancelExecutor(function () {
                _cancel = true;
            });
        //启用加载效果
        var loadingComponent = null;
        if (loading && this.getLoading(options) && !(options.cache && this._cache[url] !== undefined)) {
            loadingComponent = this.getLoading(options);
            loadingComponent.start();
        }
        var beforeSendPromise = this.beforeSend({ method: method, url: url, params: params, options: options });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promise_1.promisify(beforeSendPromise)
            .then(function () {
            if (_cancel) {
                reject(createError('Request aborted', Ajax.CODE.CANCEL));
                return;
            }
            if (options.onData) {
                options.json = false;
            }
            params = _this.getProcessedParams(method, url, params, options, reject);
            if (method === Ajax.METHODS.get) {
                if (params) {
                    url = url + "?" + params;
                }
                params = undefined;
            }
            if (options.cache && _this._cache[url] !== undefined) {
                _this.onSuccess(undefined, {
                    response: _this._cache[url],
                    options: options,
                    resolve: resolve,
                    reject: reject,
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
                            if (!chunks) {
                                console && console.error(method + " " + url + " Incorrect response");
                                return;
                            }
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
                    }
                }
                if (this.readyState !== 4)
                    return;
                //关闭加载效果
                if (loadingComponent) {
                    loadingComponent.finish();
                }
                if (options && options.cancelToken) {
                    //请求完成，删除缓存的cancel
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
                        // IE9下responseType为json时，response的值为undefined，返回值需去responseText取
                        // 其它浏览器responseType为json时，取response
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
                        reject: reject,
                    });
                    res = transform_response_1.transformResponse({ response: res, options: options, xhr: xhr, statusField: statusField });
                    if (options.cache) {
                        ajaxThis._cache[url] = res;
                    }
                    ajaxThis.onSuccess(xhr, { response: res, options: options, resolve: resolve, reject: reject });
                }
                else if (this.status === 204) {
                    ajaxThis.processResponse(null, {
                        xhr: xhr,
                        method: method,
                        url: url,
                        params: _opts.params,
                        options: options,
                        reject: reject,
                    });
                    resolve(null);
                }
                else {
                    // @ts-ignore
                    if (this.aborted) {
                        return;
                    }
                    var errorResponse = ajaxThis.processErrorResponse(this, _opts);
                    promise_1.promisify(errorResponse).then(function () {
                        ajaxThis.onError(_this, _opts);
                    });
                }
            };
            xhr.open(method, url_1.addPrefixToUrl(url, ajaxThis.prefix, options.prefix));
            //xhr.responseType = 'json';
            if (options.responseType) {
                xhr.responseType = options.responseType;
            }
            if (!options.headers || typeof options.headers['token'] === 'undefined') {
                var token = window.localStorage.getItem('token') || '';
                if (token) {
                    xhr.setRequestHeader('token', token);
                }
            }
            if (!options.headers || typeof options.headers['X-Request-Id'] === 'undefined') {
                xhr.setRequestHeader('X-Request-Id', v4_1.default());
            }
            var isContentTypeExist = false;
            var isCacheControlExist = false;
            if (options.headers) {
                for (var _i = 0, _a = Object.keys(options.headers); _i < _a.length; _i++) {
                    var k = _a[_i];
                    var v = options.headers[k];
                    var lowerCaseKey = k.toLowerCase();
                    if (lowerCaseKey === 'content-type') {
                        isContentTypeExist = true;
                        // 支持不设置Content-Type
                        if (v) {
                            xhr.setRequestHeader(k, v);
                        }
                    }
                    else {
                        if (lowerCaseKey === 'cache-control') {
                            isCacheControlExist = true;
                        }
                        else {
                            if (k === 'X-Request-Id' || k === 'token') {
                                if (!v) {
                                    continue;
                                }
                            }
                        }
                        xhr.setRequestHeader(k, v);
                    }
                }
            }
            if (!isContentTypeExist && !form_1.isFormData(params) && (!options || options.encrypt !== 'all')) {
                xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
            }
            if (!isCacheControlExist && browser_which_1.default.ie) {
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                xhr.setRequestHeader('Pragma', 'no-cache');
            }
            if (options.onProgress) {
                xhr.upload.onprogress = options.onProgress;
            }
            // prettier-ignore
            xhr.send(params);
            cancelExecutor &&
                cancelExecutor(function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        return;
                    }
                    reject(createError('Request aborted', Ajax.CODE.CANCEL, xhr));
                    // @ts-ignore
                    xhr.aborted = true;
                    xhr.abort();
                });
        })
            .catch(function (e) {
            reject(e);
            catch_1.catchAjaxError({
                e: e,
                method: method,
                url: url,
                params: params,
                callback: _this.catchError,
                type: 'log',
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
            promise && (promise.cancel = cancel);
            // 如果是再次发送的请求， 前一请求缓存已从_cacheCancel清除，这里需要重新设置
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
            //传入cancelToken的话就缓存cancel, 用来取消请求
            this.cancel(options.cancelToken);
            this._cacheCancel[options.cancelToken] = promise;
        }
        return promise;
    };
    /** session过期回调 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxBase.prototype.onSessionExpired = function (error, props) {
        var reject = props.reject;
        reject(error);
    };
    AjaxBase.prototype.getCacheKey = function (url, params, options) {
        var method = Ajax.METHODS.get;
        var _options = Object.assign({}, options, { cache: true });
        params = this.getProcessedParams(method, url, params, _options);
        return params ? url + "?" + params : url;
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
    AjaxBase.prototype.clearCache = function () {
        this._cache = {};
    };
    AjaxBase.prototype.clear = function () {
        this.clearCache();
    };
    /** 生成cancel token */
    AjaxBase.prototype.cancelToken = function () {
        return new Date().getTime() + "_" + Math.random();
    };
    /** cancel请求 */
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
