import { v4 as uuid } from 'uuid';
import browser from 'browser-which';
import { promisify } from './utils/promise';
import { isFormData } from './utils/form';
import { catchAjaxError } from './utils/catch';
import { transformResponse } from './utils/transform-response';
import { addPrefixToUrl, processParamsInUrl, splitUrlParams, needFormatData } from './utils/url';
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

    public $loading: string | symbol = '$loading';

    public transformRequest: (props: Ajax.IAjaxArgsOptions) => Ajax.IAjaxArgsOptions | Promise<Ajax.IAjaxArgsOptions>;

    /** 请求发送前 */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public beforeSend = function (props: Ajax.IAjaxArgsOptions): Ajax.IRequestResult | void {};

    /** 数据处理 */
    public processData = function (params: Ajax.IParams, options: Ajax.IAjaxProcessDataOptions): Ajax.IParams {
        return params;
    };

    /** 参数处理 */
    public processParams = function ({
        urlParams,
        params,
        paramsInOptions,
    }: Ajax.IProcessParamsOptions): Ajax.IProcessParamsResult {
        return { urlParams, params, paramsInOptions };
    };

    /** 去除 URL 中:params 格式参数后参数处理 */
    public processParamsAfter = function (props: Ajax.IProcessParamsAfterOptions): void | Promise<void> {};

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

    /** 添加默认 AJAX 错误处理程序（请勿使用，内部扩展插件使用，外部请使用 onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    public processErrorResponse<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | Promise<void> {}

    /** 添加默认 AJAX 错误处理程序 */
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

    public setLoading(loadingName: string | symbol): void {
        this.$loading = loadingName;
    }

    /** 将参数拼成 key1=val1&key2=val2 的格式 */
    private fillQueryParams = function ({
        params,
        encodeValue,
    }: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: { [name: string]: any } | string;
        encodeValue?: boolean;
    }): string[] {
        const array: string[] = [];
        const paramsKeys = Object.keys(params);
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
            if (encodeValue !== false) {
                value = encodeURIComponent(value);
            }
            array.push(`${key}=${value}`);
        }
        array.sort();
        return array;
    };

    public readonly stringifyParams = ({
        params,
        paramsInOptions,
        method,
        encodeValue,
        cache,
        processData,
    }: Ajax.IStringifyParamsOptions): {
        requestBody: string | Ajax.IParams | undefined;
        queryParams: string;
    } => {
        let requestBody: string | Ajax.IParams;
        let queryParamsArray: string[] = [];
        const isNeedFormat =
            // 如果调用方已经将参数序列化成字符串，直接返回
            // processData === false 直接返回
            // FormData 直接返回
            typeof params !== 'string' && needFormatData({ params, processData });
        if (method === Ajax.METHODS.get) {
            if (isNeedFormat) {
                // 对于 GET 请求，将参数拼成 key1=val1&key2=val2 的格式
                if (params && typeof params === 'object') {
                    queryParamsArray = this.fillQueryParams({ params, encodeValue });
                }
            } else {
                if (typeof params === 'string') {
                    queryParamsArray.push(params);
                } else {
                    requestBody = params;
                }
            }
        } else {
            if (isNeedFormat) {
                // requestBody 为 undefined 时，将其转为空字符串，避免 IE 下出现错误：invalid JSON, only supports object and array
                // requestBody 为 null 时，将其转为空字符串，避免出现错误：invalid JSON, only supports object and array
                requestBody = (typeof params !== 'undefined' && params !== null && JSON.stringify(params)) || '';
            } else {
                requestBody = params;
            }
        }

        if (paramsInOptions) {
            if (typeof paramsInOptions === 'object') {
                // 将参数拼成 key1=val1&key2=val2 的格式
                queryParamsArray.push(...this.fillQueryParams({ params: paramsInOptions, encodeValue }));
            } else {
                queryParamsArray.push(paramsInOptions);
            }
        }
        if (params && paramsInOptions) {
            queryParamsArray.sort();
        }
        if (this._config.noCache) {
            if (!cache) {
                queryParamsArray.push(`_v=${Math.floor(Math.random() * 1000000)}`);
            }
        }

        return {
            requestBody,
            queryParams: queryParamsArray.join('&'),
        };
    };

    /** 移除缓存的 cancel 请求 */
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
        requestBody: Ajax.IParams | string;
        queryParams: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        urlParams: { [name: string]: any };
        params: Ajax.IParams;
        paramsInOptions: Ajax.IOptions['params'] | string;
    } {
        /* eslint-enable @typescript-eslint/indent */
        if (options.processData !== false) {
            params = this.processData(params, { method, url, options, reject });
        }
        const processedUrlParams = splitUrlParams({
            url,
            params,
            paramsInOptions: options.params,
            processData: options.processData,
        });
        let { urlParams } = processedUrlParams;
        const { paramsInOptions: optionsParams } = processedUrlParams;
        params = processedUrlParams.params;
        const processedParams = this.processParams({
            urlParams,
            params,
            paramsInOptions: optionsParams,
            method,
            url,
            options,
            reject,
            processData: options.processData,
        });
        urlParams = processedParams.urlParams;
        params = processedParams.params;
        const { paramsInOptions } = processedParams;
        if (urlParams) {
            const processedValue = processParamsInUrl(url, urlParams);
            url = processedValue.url;
        }
        const { requestBody, queryParams } = this.stringifyParams({
            params,
            paramsInOptions,
            method,
            cache: options.cache,
            processData: options.processData,
        });
        return {
            url,
            requestBody,
            queryParams,
            params,
            urlParams,
            paramsInOptions,
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
        /** 是否显示 loading */
        loading: boolean;
        /** resolve */
        resolve: Ajax.IResolve<T>;
        /** reject */
        reject: Ajax.IReject;
        /** options */
        options?: Ajax.IOptions;
        /** 取消请求方法 */
        cancelExecutor: Ajax.ICancelExecutor;
        /** 请求 session 过期回调 */
        onSessionExpired?: Ajax.IOnSessionExpired;
        /**
         * @private 链路追踪 ID（内部变量）
         */
        xCorrelationID?: string;
        /**
         * @private 第几次重试（内部变量）
         */
        _retryTimes?: number;
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
        /** 是否显示 loading */
        loading: boolean,
        /** resolve */
        resolve: Ajax.IResolve<T>,
        /** reject */
        reject: Ajax.IReject,
        /** 请求 session 过期回调 */
        onSessionExpired: Ajax.IOnSessionExpired,
        /** options */
        options: Ajax.IOptions,
        /** 取消请求方法 */
        cancelExecutor: Ajax.ICancelExecutor
    ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise<any>;

    public async sendRequest<T>(
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
                  /** 是否显示 loading */
                  loading: boolean;
                  /** resolve */
                  resolve: Ajax.IResolve<T>;
                  /** reject */
                  reject: Ajax.IReject;
                  /** options */
                  options?: Ajax.IOptions;
                  /** 取消请求方法 */
                  cancelExecutor: Ajax.ICancelExecutor;
                  /** 请求 session 过期回调 */
                  onSessionExpired?: Ajax.IOnSessionExpired;
                  /**
                   * @private 链路追踪 ID（内部变量）
                   */
                  xCorrelationID?: string;
                  /**
                   * @private 第几次重试（内部变量）
                   */
                  _retryTimes?: number;
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
        let _retryTimes = 0;
        /** 链路追踪 ID */
        let xCorrelationID = '';
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
        } else {
            method = props;
        }
        if (!onSessionExpired) {
            onSessionExpired = this.onSessionExpired;
        }
        if (!options) {
            options = {};
        }
        if (this.transformRequest) {
            const transformed = await promisify(
                this.transformRequest({
                    method,
                    url,
                    params,
                    options,
                    loading,
                })
            );
            method = transformed.method;
            url = transformed.url;
            params = transformed.params;
            options = transformed.options;
            loading = transformed.loading;
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
            // 链路追踪 ID
            xCorrelationID,
            // 请求开始时间
            startTime: new Date().getTime(),
            /**
             * @private 第几次重试（内部变量）
             */
            _retryTimes,
        };
        let _cancel = false;
        if (cancelExecutor) {
            cancelExecutor(function (): void {
                _cancel = true;
            });
        }

        const beforeSendPromise = this.beforeSend({ method, url, params, options, loading });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return promisify(beforeSendPromise)
            .then((): void | Promise<void> => {
                if (_cancel) {
                    // aborted before send
                    reject(createError('Request aborted', Ajax.CODE.CANCEL));
                    this.responseEnd(undefined, _opts, { success: false });
                    return;
                }

                if (options.onData) {
                    options.json = false;
                }

                const processedValue = this.getProcessedParams(method, url, params, options, reject);

                const processParamsAfterPromise = this.processParamsAfter({
                    params: processedValue.params,
                    paramsInOptions: processedValue.paramsInOptions,
                    method,
                    url,
                    options,
                    reject,
                    processData: options.processData,
                });
                return promisify(processParamsAfterPromise).then((): void => {
                    if (_cancel) {
                        // aborted before send
                        reject(createError('Request aborted', Ajax.CODE.CANCEL));
                        this.responseEnd(undefined, _opts, { success: false });
                        return;
                    }

                    url = processedValue.url;
                    const { queryParams, requestBody } = processedValue;
                    if (queryParams) {
                        url = `${url}?${queryParams}`;
                    }
                    if (options.cache && this._cache[url] !== undefined) {
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
                                        const consoleMethod: 'error' | 'warn' =
                                            this.readyState === 4 ? 'error' : 'warn';
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

                        if (options && options.cancelToken) {
                            // 请求完成，删除缓存的 cancel
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
                                // IE9 下 responseType 为 json 时，response 的值为 undefined，返回值需去 responseText 取
                                // 其它浏览器 responseType 为 json 时，取 response
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
                                // 支持不设置 Content-Type
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
                            if (
                                // 重发的请求和前面的请求使用同样的 xCorrelationID，不需要生成新的 id
                                !_opts.xCorrelationID
                            ) {
                                _opts.xCorrelationID = uuid();
                            }
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
                        requestBody as Document | Blob | BufferSource | FormData | URLSearchParams | string | null
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
                });
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

            // 如果是再次发送的请求，前一请求缓存已从_cacheCancel 清除，这里需要重新设置
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
            // 传入 cancelToken 的话就缓存 cancel, 用来取消请求
            this.cancel(options.cancelToken);
            this._cacheCancel[options.cancelToken] = promise;
        }
        return promise;
    }

    /** session 过期回调 */
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
        params = processedValue.queryParams;
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

    public clearCacheByUrl(url: string): void {
        const keys = Object.keys(this._cache);
        // 匹配 url 或者以 url? 开头的key
        const urlPattern = new RegExp(`^${url}(\\?|$)`);

        for (const key of keys) {
            if (urlPattern.test(key)) {
                delete this._cache[key];
            }
        }
    }

    public clearCache(): void {
        this._cache = {};
    }

    public clear(): void {
        this.clearCache();
    }

    /** 生成 cancel token */
    public cancelToken(): string {
        return `${new Date().getTime()}_${Math.random()}`;
    }

    /** cancel 请求 */
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
             * Get 请求是否添加随机字符串阻止缓存
             * @default true
             */
            noCache?: boolean;
            /**
             * url 前缀
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
             * session 过期回调
             */
            onSessionExpired?: Ajax.IOnSessionExpired;
            /**
             * 请求发送前
             */
            beforeSend?: (props: {
                method: Ajax.IMethod;
                url: string;
                params: Ajax.IParams;
                options: Ajax.IOptions;
                /** 是否显示 loading */
                loading: boolean;
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
            /** 自定义错误处理（返回 false 则不再往下执行。重写了 onError 的话不再使用） */
            processError?: (xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions) => void | boolean;
            /** 捕获错误 */
            catchError?: (props: Ajax.ICatchErrorOptions) => void;
            /** 修改请求配置 */
            transformRequest?: (props: Ajax.IAjaxArgsOptions) => Ajax.IAjaxArgsOptions | Promise<Ajax.IAjaxArgsOptions>;
        } = {}
    ): void => {
        if (typeof options.noCache !== 'undefined') {
            console.warn('http-ajax: `noCache` will be deprecated');
        }
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const value = options[key as keyof typeof options];
                if (
                    key === 'prefix' ||
                    key === 'onSuccess' ||
                    key === 'onError' ||
                    key === 'onSessionExpired' ||
                    key === 'beforeSend' ||
                    key === 'processData' ||
                    key === 'responseEnd' ||
                    key === 'processError' ||
                    key === 'catchError' ||
                    key === 'transformRequest'
                ) {
                    if (key === 'prefix') {
                        if (typeof value === 'string') {
                            this.prefix = value;
                        }
                    } else {
                        if (typeof value === 'function') {
                            if (key === 'beforeSend') {
                                const { beforeSend } = this;
                                this[key as 'beforeSend'] = function (
                                    props: Ajax.IAjaxArgsOptions
                                ): Ajax.IRequestResult | void {
                                    return promisify((value as Ajax.IAjax['beforeSend'])(props)).then(function () {
                                        return beforeSend(props);
                                    });
                                };
                            } else if (key === 'processData') {
                                const { processData } = this;
                                this[key as 'processData'] = function (params, props): Ajax.IParams {
                                    const processedParams = (value as Ajax.IAjax['processData'])(params, props);
                                    return processData(processedParams, props);
                                };
                            } else if (key === 'responseEnd') {
                                const { responseEnd } = this;
                                this[key as 'responseEnd'] = function (xhr, _opts, props) {
                                    (value as Ajax.IAjax['responseEnd'])(xhr, _opts, props);
                                    responseEnd(xhr, _opts, props);
                                };
                            } else {
                                this[key as keyof Ajax.IConfigOptions] = value;
                            }
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
