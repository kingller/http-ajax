import { v4 as uuid } from 'uuid';
import browser from 'browser-which';
import { promisify } from './utils/promise';
import { isFormData } from './utils/form';
import { catchAjaxError } from './utils/catch';
import { transformResponse } from './utils/transform-response';
import { addPrefixToUrl, processParamsInUrl } from './utils/url';
import { ILoading } from './interface';
import * as Ajax from './interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createError(message: string, code?: string | number, request?: any, response?: any): Ajax.IError {
    const error: Ajax.IError = new Error(message) as Ajax.IError;
    if (code) {
        error.errorCode = code;
    }
    error.request = request;
    error.response = response;
    error.isAjaxError = true;
    error.toJSON = function (): {
        errorMsg: string;
        errorCode?: string | number;
    } {
        return {
            // Standard
            errorMsg: message,
            errorCode: code,
        };
    };
    return error;
}

interface IConfigItem {
    noCache: boolean;
    statusField?: string;
}
class AjaxBase {
    public _config: IConfigItem = {
        noCache: false,
        statusField: 'result',
    };

    public readonly getConfig = (): IConfigItem => {
        return this._config;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly get = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS.get, url, params, options, false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly post = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS.post, url, params, options, false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly put = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS.put, url, params, options, false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly del = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS.del, url, params, options, false);
    };

    public readonly loadable = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS.get, url, params, options, true);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        post: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS.post, url, params, options, true);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        put: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS.put, url, params, options, true);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        del: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS.del, url, params, options, true);
        },
    };

    public prefix = '/api';

    public $loading = '$loading';

    /** 请求发送前 */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public beforeSend = function (props: Ajax.IAjaxArgsOptions): Ajax.IRequestResult | void {};

    /** 数据处理 */
    public processData = function (params: Ajax.IParams, props: Ajax.IAjaxProcessDataOptions): Ajax.IParams {
        return params;
    };

    /** 去除URL中:params格式参数后数据处理 */
    public processDataAfter = function (params: Ajax.IParams, props: Ajax.IAjaxProcessDataAfterOptions): Ajax.IParams {
        return params;
    };

    public processResponse = function (
        response: Ajax.IResult | null,
        props: Ajax.IProcessResponseOptions
    ): Ajax.IResult {
        return response;
    };

    /** 私有变量，请勿使用 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _cache: { [name: string]: any } = {};

    /** 私有变量，请勿使用 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _cacheCancel: { [name: string]: Ajax.IPromise<any> } = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onSuccess<T = any>(
        xhr: XMLHttpRequest,
        {
            response,
            options,
            resolve,
            reject,
        }: {
            response: Ajax.IResult;
            options: Ajax.IOptions;
            resolve: Ajax.IResolve<T>;
            reject: Ajax.IReject;
            /** method */
            method?: Ajax.IMethod;
            /** url */
            url?: string;
            /** 请求参数 */
            params?: Ajax.IParams | undefined;
            xCorrelationID?: string;
        }
    ): void {
        const { statusField } = this._config;
        if (response[statusField]) {
            resolve(response.data as T);
        } else if (response[statusField] === false) {
            reject(response);
        } else {
            resolve(response as T);
        }
    }

    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    public processErrorResponse<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | Promise<void> {}

    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void {
        _opts.reject(xhr);
    }

    /** 捕获错误 */
    public catchError(props: Ajax.ICatchErrorOptions): void {
        const { errorCode, errorMsg, remark, type } = props;
        if (type === 'uncaught') {
            throw new Error(`${errorCode || ''} ${errorMsg} ${remark || ''}`);
        }
    }

    public setLoading(loadingName: string): void {
        this.$loading = loadingName;
    }

    /** 加载进度条 */
    public getLoading(options: Ajax.IOptions): ILoading | undefined {
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
    }

    public readonly stringifyParams = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: { [name: string]: any } | string,
        method: Ajax.IMethod,
        options: Ajax.IStringifyParamsOptions
    ): string => {
        // 如果调用方已经将参数序列化成字符串，直接返回
        if (typeof params === 'string') return params;
        // 对于非GET请求，直接序列化该参数对象
        // requestBody为undefined时，将其转为空字符串，避免IE下出现错误：invalid JSON, only supports object and array
        // requestBody为null时，将其转为空字符串，避免出现错误：invalid JSON, only supports object and array
        if (method !== Ajax.METHODS.get)
            return (typeof params !== 'undefined' && params !== null && JSON.stringify(params)) || '';
        // 对于GET请求，将参数拼成key1=val1&key2=val2的格式
        const array = [];
        if (params && typeof params === 'object') {
            const paramsKeys = Object.keys(params).sort();
            for (let i = 0; i < paramsKeys.length; i++) {
                const key = paramsKeys[i];
                let value = '';
                if (typeof params[key] !== 'undefined' && params[key] !== null) {
                    if (params[key] instanceof Array) {
                        value = params[key].join(',');
                    } else {
                        value = params[key];
                    }
                }
                if (!options || options.encodeValue !== false) {
                    value = encodeURIComponent(value);
                }
                array.push(`${key}=${value}`);
            }
        }
        if (this._config.noCache) {
            if (!options || !options.cache) {
                array.push(`_v=${Math.floor(Math.random() * 1000000)}`);
            }
        }
        return array.join('&');
    };

    /** 移除缓存的cancel请求 */
    private removeCacheCancel(token: string): void {
        if (this._cacheCancel[token]) {
            delete this._cacheCancel[token];
        }
    }

    private getProcessedParams(
        method: Ajax.IMethod,
        url: string,
        params: Ajax.IParams | undefined,
        options: Ajax.IOptions = {},
        reject?: Ajax.IReject
        /* eslint-disable @typescript-eslint/indent */
    ): {
        url: string;
        params: Ajax.IParams | undefined;
    } {
        /* eslint-enable @typescript-eslint/indent */
        if (options.processData !== false) {
            params = this.processData(params, { method, url, options, reject });
        }
        const processedValue = processParamsInUrl(url, params);
        url = processedValue.url;
        params = processedValue.params;
        params = this.processDataAfter(params, { method, url, options, reject, processData: options.processData });
        if (options.processData !== false) {
            if (!isFormData(params)) {
                params = this.stringifyParams(params, method, options);
            }
        }
        return {
            url,
            params,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public responseEnd(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions, { success: boolean }): void {}

    /**
     * 发送请求
     */
    public sendRequest<T>(props: {
        /**
         * method
         * 'GET' | 'POST' | 'PUT' | 'DELETE'
         */
        method: Ajax.IMethod;
        /** url */
        url: string;
        /** 请求参数 */
        params?: Ajax.IParams | undefined;
        /** 是否显示loading */
        loading: boolean;
        /** resolve */
        resolve: Ajax.IResolve<T>;
        /** reject */
        reject: Ajax.IReject;
        /** options */
        options?: Ajax.IOptions;
        /** 取消请求方法 */
        cancelExecutor: Ajax.ICancelExecutor;
        /** 请求session过期回调 */
        onSessionExpired?: Ajax.IOnSessionExpired;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }): Promise<any>;

    /**
     * 发送请求
     */
    public sendRequest<T>(
        /** method */
        method: Ajax.IMethod,
        /** url */
        url: string,
        /** 请求参数 */
        params: Ajax.IParams | undefined,
        /** 是否显示loading */
        loading: boolean,
        /** resolve */
        resolve: Ajax.IResolve<T>,
        /** reject */
        reject: Ajax.IReject,
        /** 请求session过期回调 */
        onSessionExpired: Ajax.IOnSessionExpired,
        /** options */
        options: Ajax.IOptions,
        /** 取消请求方法 */
        cancelExecutor: Ajax.ICancelExecutor
    ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise<any>;

    public sendRequest<T>(
        /* eslint-disable @typescript-eslint/indent */
        props:
            | Ajax.IMethod
            | {
                  /** method */
                  method: Ajax.IMethod;
                  /** url */
                  url: string;
                  /** 请求参数 */
                  params?: Ajax.IParams | undefined;
                  /** 是否显示loading */
                  loading: boolean;
                  /** resolve */
                  resolve: Ajax.IResolve<T>;
                  /** reject */
                  reject: Ajax.IReject;
                  /** options */
                  options?: Ajax.IOptions;
                  /** 取消请求方法 */
                  cancelExecutor: Ajax.ICancelExecutor;
                  /** 请求session过期回调 */
                  onSessionExpired?: Ajax.IOnSessionExpired;
              },
        /* eslint-enable @typescript-eslint/indent */
        url?: string,
        params?: Ajax.IParams | undefined,
        loading?: boolean,
        resolve?: Ajax.IResolve<T>,
        reject?: Ajax.IReject,
        onSessionExpired?: Ajax.IOnSessionExpired,
        options?: Ajax.IOptions,
        cancelExecutor?: Ajax.ICancelExecutor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        let method: Ajax.IMethod;
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
        } else {
            method = props;
        }
        if (!onSessionExpired) {
            onSessionExpired = this.onSessionExpired;
        }
        const _opts = {
            method,
            url,
            params,
            loading,
            resolve,
            reject,
            onSessionExpired,
            options,
            cancelExecutor,
            // 链路追踪ID
            xCorrelationID: '',
            // 请求开始时间
            startTime: new Date().getTime(),
        };
        if (!options) {
            options = {};
        }
        let _cancel = false;
        if (cancelExecutor) {
            cancelExecutor(function (): void {
                _cancel = true;
            });
        }
        // 启用加载效果
        let loadingComponent: ILoading = null;
        if (loading && this.getLoading(options)) {
            loadingComponent = this.getLoading(options);
            loadingComponent.start();
        }

        const beforeSendPromise = this.beforeSend({ method, url, params, options });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promisify(beforeSendPromise)
            .then((): void => {
                if (_cancel) {
                    reject(createError('Request aborted', Ajax.CODE.CANCEL));
                    if (loadingComponent) loadingComponent.finish();
                    return;
                }

                if (options.onData) {
                    options.json = false;
                }
                const processedValue = this.getProcessedParams(method, url, params, options, reject);
                url = processedValue.url;
                params = processedValue.params;
                if (method === Ajax.METHODS.get) {
                    if (params) {
                        url = `${url}?${params}`;
                    }
                    params = undefined;
                }
                if (options.cache && this._cache[url] !== undefined) {
                    if (loadingComponent) loadingComponent.finish();
                    this.responseEnd(undefined, _opts, { success: true });
                    this.onSuccess<T>(undefined, {
                        response: this._cache[url],
                        options,
                        resolve,
                        reject,
                        method: _opts.method,
                        url: _opts.url,
                        params: _opts.params,
                    });
                    return;
                }
                const xhr = new XMLHttpRequest();
                let chunked: string[] = [];
                const ajaxThis = this;
                xhr.onreadystatechange = function (): void {
                    if (options.onData) {
                        if (this.readyState === 3 || this.readyState === 4) {
                            // 因为请求响应较快时，会出现一次返回多个块，所以使用取出数组新增项的做法
                            if (this.response) {
                                let chunks: string[] = this.response.match(/<chunk>([\s\S]*?)<\/chunk>/g);
                                if (chunks) {
                                    chunks = chunks.map((item: string): string => item.replace(/<\/?chunk>/g, ''));
                                    // 取出新增的数据
                                    const data: string[] = chunks.slice(chunked.length);
                                    data.forEach((item: string): void => {
                                        try {
                                            options.onData(JSON.parse(item));
                                        } catch (e) {
                                            options.onData(item);
                                        }
                                    });
                                    chunked = chunks;
                                } else {
                                    const consoleMethod: 'error' | 'warn' = this.readyState === 4 ? 'error' : 'warn';
                                    // eslint-disable-next-line no-console
                                    if (console && console[consoleMethod]) {
                                        // eslint-disable-next-line no-console
                                        console[consoleMethod](`${method} ${url} Incorrect response`);
                                    }
                                }
                            }
                        }
                    }

                    if (this.readyState !== 4) return;

                    // 关闭加载效果
                    if (loadingComponent) {
                        loadingComponent.finish();
                    }

                    if (options && options.cancelToken) {
                        // 请求完成，删除缓存的cancel
                        ajaxThis.removeCacheCancel(options.cancelToken);
                    }

                    if (this.status === 200 || this.status === 201) {
                        let res: Ajax.IResult;
                        const { statusField } = ajaxThis._config;
                        if ((xhr.responseType && xhr.responseType !== 'json') || options.json === false) {
                            res = {
                                [statusField]: true,
                                data: this.response || this.responseText,
                            };
                        } else {
                            // IE9下responseType为json时，response的值为undefined，返回值需去responseText取
                            // 其它浏览器responseType为json时，取response
                            if (xhr.responseType === 'json' && typeof this.response !== 'undefined') {
                                res = this.response;
                            } else {
                                res = JSON.parse(this.response || this.responseText || '{}');
                            }
                        }
                        res = ajaxThis.processResponse(res, {
                            xhr,
                            method,
                            url,
                            params: _opts.params,
                            options,
                            resolve,
                            reject,
                            xCorrelationID: _opts.xCorrelationID,
                        });
                        res = transformResponse({ response: res, options, xhr, statusField });
                        if (options.cache) {
                            ajaxThis._cache[url] = res;
                        }
                        ajaxThis.responseEnd(xhr, _opts, { success: true });
                        ajaxThis.onSuccess<T>(xhr, {
                            response: res,
                            method: _opts.method,
                            url: _opts.url,
                            params: _opts.params,
                            options,
                            resolve,
                            reject,
                            xCorrelationID: _opts.xCorrelationID,
                        });
                    } else if (this.status === 204) {
                        ajaxThis.processResponse(null, {
                            xhr,
                            method,
                            url,
                            params: _opts.params,
                            options,
                            resolve,
                            reject,
                            xCorrelationID: _opts.xCorrelationID,
                        });
                        ajaxThis.responseEnd(xhr, _opts, { success: true });
                        resolve(null);
                    } else {
                        ajaxThis.responseEnd(xhr, _opts, { success: false });
                        // @ts-ignore
                        if (this.aborted) {
                            return;
                        }
                        const errorResponse = ajaxThis.processErrorResponse<T>(this, _opts);
                        promisify(errorResponse).then(() => {
                            ajaxThis.onError<T>(this, _opts);
                        });
                    }
                };
                xhr.open(method, addPrefixToUrl(url, ajaxThis.prefix, options.prefix));
                // xhr.responseType = 'json';
                if (options.responseType) {
                    xhr.responseType = options.responseType;
                }
                if ((!options.headers || typeof options.headers.token === 'undefined') && !options.simple) {
                    let token = '';
                    try {
                        token = window.localStorage.getItem('token') || '';
                    } catch (e) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        console && console.error('Failed to get token from localStorage');
                    }
                    if (token) {
                        xhr.setRequestHeader('token', token);
                    }
                }
                let isContentTypeExist = false;
                let isCacheControlExist = false;
                let isXCorrelationIDExist = false;
                if (options.headers) {
                    for (const k of Object.keys(options.headers)) {
                        const v = options.headers[k];
                        const lowerCaseKey = k.toLowerCase();
                        if (lowerCaseKey === 'content-type') {
                            isContentTypeExist = true;
                            // 支持不设置Content-Type
                            if (v) {
                                xhr.setRequestHeader(k, v);
                            }
                        } else {
                            if (lowerCaseKey === 'cache-control') {
                                isCacheControlExist = true;
                            } else {
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
                        _opts.xCorrelationID = uuid();
                        xhr.setRequestHeader('X-Correlation-ID', _opts.xCorrelationID);
                    }
                    if (!isContentTypeExist && !isFormData(params) && (!options || options.encrypt !== 'all')) {
                        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                    }
                    if (!isCacheControlExist && browser.ie) {
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
                xhr.send(
                    params as Document | Blob | BufferSource | FormData | URLSearchParams | string | null
                );

                if (cancelExecutor) {
                    cancelExecutor(function (): void {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            return;
                        }
                        reject(createError('Request aborted', Ajax.CODE.CANCEL, xhr));
                        // @ts-ignore
                        xhr.aborted = true;
                        xhr.abort();
                    });
                }
            })
            .catch((e: Error): void => {
                this.responseEnd(undefined, _opts, { success: false });
                reject(e);
                catchAjaxError({
                    e,
                    method,
                    url,
                    params,
                    callback: this.catchError,
                    type: 'log',
                    xCorrelationID: _opts.xCorrelationID,
                    options,
                });
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public request<T = any>(
        method: Ajax.IMethod,
        url: string,
        params: Ajax.IParams | undefined,
        options?: Ajax.IOptions,
        loading?: boolean
    ): Ajax.IRequestResult<T> {
        let cancel;
        let promise: Ajax.IRequestResult<T>;
        const cancelExecutor = (c: () => void): void => {
            // An executor function receives a cancel function as a parameter
            cancel = c;
            if (promise) {
                promise.cancel = cancel;
            }

            // 如果是再次发送的请求， 前一请求缓存已从_cacheCancel清除，这里需要重新设置
            if (options && options.cancelToken && promise && !this._cacheCancel[options.cancelToken]) {
                this._cacheCancel[options.cancelToken] = promise;
            }
        };
        promise = new Promise((resolve, reject): void => {
            // prettier-ignore
            this.sendRequest<T>(
                method,
                url,
                params,
                loading,
                resolve,
                reject,
                this.onSessionExpired,
                options,
                cancelExecutor
            );
        });
        promise.cancel = cancel;
        if (options && options.cancelToken) {
            // 传入cancelToken的话就缓存cancel, 用来取消请求
            this.cancel(options.cancelToken);
            this._cacheCancel[options.cancelToken] = promise;
        }
        return promise;
    }

    /** session过期回调 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onSessionExpired<T = any>(
        error?: { errorCode: number; errorMsg: string },
        props?: Ajax.IRequestOptions
    ): void {
        const { reject } = props;
        reject(error);
    }

    private getCacheKey(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): string {
        const method = Ajax.METHODS.get;
        const _options = { ...options, cache: true };
        const processedValue = this.getProcessedParams(method, url, params, _options);
        url = processedValue.url;
        params = processedValue.params;
        return params ? `${url}?${params}` : url;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getCache<T = any>(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): T | undefined {
        const key = this.getCacheKey(url, params, options);
        return this._cache[key];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getAllCache(): { [name: string]: any } {
        return this._cache;
    }

    public removeCache(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): void {
        const key = this.getCacheKey(url, params, options);
        delete this._cache[key];
    }

    public clearCache(): void {
        this._cache = {};
    }

    public clear(): void {
        this.clearCache();
    }

    /** 生成cancel token */
    public cancelToken(): string {
        return `${new Date().getTime()}_${Math.random()}`;
    }

    /** cancel请求 */
    public cancel(token: string): void {
        if (!token) {
            return;
        }
        const promise = this._cacheCancel[token];
        if (!promise) {
            return;
        }
        this.removeCacheCancel(token);
        promise.cancel();
    }

    /** 判断错误类型是否为取消请求 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public isCancel(error: any): boolean {
        if (error && typeof error === 'object' && error.errorCode === Ajax.CODE.CANCEL) {
            return true;
        }
        return false;
    }

    /** 配置 */
    public config = (
        options: {
            /**
             * Get请求是否添加随机字符串阻止缓存
             * @default true
             */
            noCache?: boolean;
            /**
             * url前缀
             * @default '/api'
             */
            prefix?: string;
            /**
             * 成功失败标志字段
             * @default 'result'
             */
            statusField?: string;
            /**
             * 成功回调
             */
            onSuccess?: Ajax.IOnSuccess;
            /**
             * 失败回调
             */
            onError?: Ajax.IOnError;
            /**
             * session过期回调
             */
            onSessionExpired?: Ajax.IOnSessionExpired;
            /**
             * 加载进度条
             */
            getLoading?: (options: Ajax.IOptions) => ILoading;
            /**
             * 请求发送前
             */
            beforeSend?: (props: {
                method: Ajax.IMethod;
                url: string;
                params: Ajax.IParams;
                options: Ajax.IOptions;
            }) => Ajax.IRequestResult | void;
            /**
             * 数据处理
             */
            processData?: (
                params: Ajax.IParams,
                props: { method: Ajax.IMethod; url: string; options: Ajax.IOptions }
            ) => Ajax.IParams;
            /** 请求结束 */
            responseEnd?: (xhr?: XMLHttpRequest, _opts?: Ajax.IRequestOptions, props?: { success: boolean }) => void;
            /** 捕获错误 */
            catchError?: (props: Ajax.ICatchErrorOptions) => void;
        } = {}
    ): void => {
        if (typeof options.noCache !== 'undefined') {
            console.warn('http-ajax: `noCache` will be deprecated in next version `4.0.0`');
        }
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const value = options[key as keyof typeof options];
                if (
                    key === 'prefix' ||
                    key === 'onSuccess' ||
                    key === 'onError' ||
                    key === 'onSessionExpired' ||
                    key === 'getLoading' ||
                    key === 'beforeSend' ||
                    key === 'processData' ||
                    key === 'responseEnd' ||
                    key === 'catchError'
                ) {
                    if (key === 'prefix') {
                        if (typeof value === 'string') {
                            this.prefix = value;
                        }
                    } else {
                        if (typeof value === 'function') {
                            this[key as keyof Ajax.IConfigOptions] = value;
                        }
                    }
                } else {
                    this._config[key] = value;
                }
            }
        }
    };
}

export default AjaxBase;
