'use strict';
import _ from 'lodash';
import uuid from 'uuid/v4';
import { promisify } from './utils/promise';
import { isFormData } from './utils/form';
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

class AjaxBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public _config: { noCache: boolean; statusField?: string; } = {
        noCache: true,
        statusField: 'result',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly get = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS['get'], url, params, false, options);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly post = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS['post'], url, params, false, options);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly put = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS['put'], url, params, false, options);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly del = <T = any>(
        url: string,
        params?: Ajax.IParams,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> => {
        // eslint-disable-next-line  @typescript-eslint/no-use-before-define
        return this.request<T>(Ajax.METHODS['del'], url, params, false, options);
    };

    public readonly loadable = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS['get'], url, params, true, options);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        post: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS['post'], url, params, true, options);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        put: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS['put'], url, params, true, options);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        del: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions): Ajax.IRequestResult<T> => {
            // eslint-disable-next-line  @typescript-eslint/no-use-before-define
            return this.request<T>(Ajax.METHODS['del'], url, params, true, options);
        },
    };

    public prefix = '/api';

    public $loading = '$loading';

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public beforeSend = function (props: Ajax.IAjaxArgsOptions): Ajax.IRequestResult | void { };

    public processData = function (params: Ajax.IParams, props: Ajax.IAjaxProcessDataOptions): Ajax.IParams {
        return params;
    };

    public processResponse = function (response: Ajax.IResult, props: Ajax.IProcessResponseOptions): Ajax.IResult {
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
        }: { response: Ajax.IResult; options: Ajax.IOptions; resolve: Ajax.IResolve<T>; reject: Ajax.IReject }
    ): void {
        if (response.result) {
            resolve(response.data as T);
        } else if (response.result === false) {
            reject(response);
        } else {
            resolve(response as T);
        }
    }

    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public processErrorResponse<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | Promise<void> {
    }

    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void {
        _opts.reject(xhr);
    }

    public setLoading(loadingName: string): void {
        this.$loading = loadingName;
    }

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
        options: Ajax.IOptions
    ): string => {
        //如果调用方已经将参数序列化成字符串，直接返回
        if (typeof params === 'string') return params;
        //对于非GET请求，直接序列化该参数对象
        //requestBody为undefined时，将其转为空字符串，避免IE下出现错误：invalid JSON, only supports object and array
        //requestBody为null时，将其转为空字符串，避免出现错误：invalid JSON, only supports object and array
        if (method !== Ajax.METHODS.get) return (params !== null && JSON.stringify(params)) || '';
        //对于GET请求，将参数拼成key1=val1&key2=val2的格式
        const array = [];
        params = _.pick(params, _.keys(params).sort());
        for (const key in params) {
            array.push(
                `${key}=${encodeURIComponent(
                    // prettier-ignore
                    params[key] === null || params[key] === undefined
                        ? ''
                        : params[key] instanceof Array
                            ? params[key].join(',')
                            : params[key]
                )}`
            );
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
        this._cacheCancel[token] && delete this._cacheCancel[token];
    }

    private getProcessedParams(
        method: Ajax.IMethod,
        url: string,
        params: Ajax.IParams | undefined,
        options: Ajax.IOptions = {}
    ): Ajax.IParams | undefined {
        if (options.processData !== false) {
            params = this.processData(params, { method, url, options });
            if (!isFormData(params)) {
                params = this.stringifyParams(params, method, options);
            }
        }
        return params;
    }

    public sendRequest<T>(
        method: Ajax.IMethod,
        url: string,
        params: Ajax.IParams | undefined,
        loading: boolean,
        resolve: Ajax.IResolve<T>,
        reject: Ajax.IReject,
        onSessionExpired: Ajax.IOnSessionExpired,
        options: Ajax.IOptions,
        cancelExecutor: Ajax.ICancelExecutor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
        const _opts = { method, url, params, loading, resolve, reject, onSessionExpired, options, cancelExecutor };
        !options && (options = {});
        let _cancel = false;
        cancelExecutor &&
            cancelExecutor(function (): void {
                _cancel = true;
            });
        //启用加载效果
        let loadingComponent: ILoading = null;
        if (loading && this.getLoading(options) && !(options.cache && this._cache[url] !== undefined)) {
            loadingComponent = this.getLoading(options);
            loadingComponent.start();
        }

        let beforeSendPromise = this.beforeSend({ method, url, params, options });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promisify(beforeSendPromise)
            .then((): void => {
                if (_cancel) {
                    reject(createError('Request aborted', Ajax.CODE.CANCEL));
                    return;
                }

                if (options.onData) {
                    options.json = false;
                }
                params = this.getProcessedParams(method, url, params, options);
                if (method === Ajax.METHODS.get) {
                    url = `${url}?${params}`;
                    params = undefined;
                }
                if (options.cache && this._cache[url] !== undefined) {
                    this.onSuccess<T>(undefined, {
                        response: this._cache[url],
                        options,
                        resolve,
                        reject,
                    });
                    return;
                }
                const xhr = new XMLHttpRequest();
                let chunked: string[] = [];
                const ajaxThis = this;
                xhr.onreadystatechange = function (): void {
                    if (options.onData) {
                        if ([3, 4].includes(this.readyState)) {
                            // 因为请求响应较快时，会出现一次返回多个块，所以使用取出数组新增项的做法
                            if (this.response) {
                                let chunks: string[] = this.response.match(/<chunk>(.*?)<\/chunk>/g);
                                if (!chunks) {
                                    console.error(`${method} ${url} Incorrect response`);
                                    return;
                                }
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
                            }
                        }
                    }

                    if (this.readyState !== 4) return;

                    //关闭加载效果
                    if (loadingComponent) {
                        loadingComponent.finish();
                    }

                    if (options && options.cancelToken) {
                        //请求完成，删除缓存的cancel
                        ajaxThis.removeCacheCancel(options.cancelToken);
                    }

                    if (this.status === 200 || this.status === 201) {
                        let res: Ajax.IResult;
                        if (options.json === false) {
                            res = {
                                result: true,
                                data: this.response || this.responseText,
                            };
                        } else {
                            res = JSON.parse(this.response || this.responseText || '{}');
                        }
                        if (options.cache) {
                            ajaxThis._cache[url] = res;
                        }
                        res = ajaxThis.processResponse(res, { xhr, method, url, params: _opts.params, options });
                        ajaxThis.onSuccess<T>(xhr, { response: res, options, resolve, reject });
                    } else if (this.status === 204) {
                        resolve(null);
                    } else {
                        // @ts-ignore
                        if (this.aborted) {
                            return;
                        }
                        const errorResponse = ajaxThis.processErrorResponse<T>(this, _opts);
                        promisify(errorResponse).then(() => {
                            ajaxThis.onError<T>(this, _opts);
                        }).catch(function (e)  {
                            reject(e);
                        });
                    }
                };
                xhr.open(method, `${typeof options.prefix === 'string' ? options.prefix : ajaxThis.prefix}${url}`);
                //xhr.responseType = 'json';
                if (options.responseType) {
                    xhr.responseType = options.responseType;
                }
                xhr.setRequestHeader('token', window.localStorage.getItem('token') || '');
                xhr.setRequestHeader('X-Request-Id', uuid());
                let isContentTypeExist = false;
                if (options.headers) {
                    for (const [k, v] of Object.entries(options.headers)) {
                        if (_.toLower(k) === 'content-type') {
                            isContentTypeExist = true;
                            // 支持不设置Content-Type
                            if (v) {
                                xhr.setRequestHeader(k, v);
                            }
                        } else {
                            xhr.setRequestHeader(k, v);
                        }
                    }
                }
                if (!isContentTypeExist && !isFormData(params) && (!options || options.encrypt !== 'all')) {
                    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                }

                if (options.onProgress) {
                    xhr.upload.onprogress = options.onProgress;
                }

                // prettier-ignore
                xhr.send(
                    params as
                    | string
                    | Document
                    | Blob
                    | ArrayBufferView
                    | ArrayBuffer
                    | FormData
                    | URLSearchParams
                    | ReadableStream<Uint8Array>
                );

                cancelExecutor &&
                    cancelExecutor(function (): void {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            return;
                        }
                        reject(createError('Request aborted', Ajax.CODE.CANCEL, xhr));
                        // @ts-ignore
                        xhr.aborted = true;
                        xhr.abort();
                    });
            })
            .catch((e: Error): void => {
                reject(e);
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private request<T = any>(
        method: Ajax.IMethod,
        url: string,
        params: Ajax.IParams | undefined,
        loading: boolean,
        options?: Ajax.IOptions
    ): Ajax.IRequestResult<T> {
        let cancel;
        let promise: Ajax.IRequestResult<T>;
        function cancelExecutor(c: () => void): void {
            // An executor function receives a cancel function as a parameter
            cancel = c;
            promise && (promise.cancel = cancel);
        }
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
            //传入cancelToken的话就缓存cancel, 用来取消请求
            this.cancel(options.cancelToken);
            this._cacheCancel[options.cancelToken] = promise;
        }
        return promise;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onSessionExpired<T = any>(
        error?: { errorCode: number; errorMsg: string },
        props?: Ajax.IRequestOptions
    ): void {
        const { reject } = props;
        reject(error);
    }

    public getCacheKey(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): string {
        const method = Ajax.METHODS.get;
        const _options = Object.assign({}, options, { cache: true });
        params = this.getProcessedParams(method, url, params, _options);
        return `${url}?${params}`;
    }

    public removeCache(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): void {
        const key = this.getCacheKey(url, params, options);
        delete this._cache[key];
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

    public config = (options: {
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
    } = {}): void => {
        const { prefix } = options;
        if (typeof prefix === 'string') {
            this.prefix = prefix;
        }
        const restOptions = _.omit(options, ['prefix']);
        Object.assign(this._config, restOptions);
    };
}

export default AjaxBase;
