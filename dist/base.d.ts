import * as Ajax from './interface';
interface IConfigItem {
    noCache: boolean;
    statusField?: string;
}
declare class AjaxBase {
    _config: IConfigItem;
    readonly getConfig: () => IConfigItem;
    readonly get: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T>;
    readonly post: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T>;
    readonly put: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T>;
    readonly del: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T>;
    readonly loadable: {
        get: <T = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T>;
        post: <T_1 = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T_1>;
        put: <T_2 = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T_2>;
        del: <T_3 = any>(url: string, params?: Ajax.IParams, options?: Ajax.IOptions) => Ajax.IRequestResult<T_3>;
    };
    prefix: string;
    $loading: string | symbol;
    /** 请求发送前 */
    beforeSend: (props: Ajax.IAjaxArgsOptions) => Ajax.IRequestResult | void;
    /** 数据处理 */
    processData: (params: Ajax.IParams, options: Ajax.IAjaxProcessDataOptions) => Ajax.IParams;
    /** 参数处理 */
    processParams: ({ urlParams, params, paramsInOptions, }: Ajax.IProcessParamsOptions) => Ajax.IProcessParamsResult;
    /** 去除 URL 中:params 格式参数后参数处理 */
    processParamsAfter: (props: Ajax.IProcessParamsAfterOptions) => void | Promise<void>;
    processResponse: (response: Ajax.IResult | null, props: Ajax.IProcessResponseOptions) => Ajax.IResult;
    /** 私有变量，请勿使用 */
    private _cache;
    /** 私有变量，请勿使用 */
    private _cacheCancel;
    onSuccess<T = any>(xhr: XMLHttpRequest, { response, options, resolve, reject, }: {
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
    }): void;
    /** 添加默认 AJAX 错误处理程序（请勿使用，内部扩展插件使用，外部请使用 onError） */
    processErrorResponse<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | Promise<void>;
    /** 添加默认 AJAX 错误处理程序 */
    onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void;
    /** 捕获错误 */
    catchError(props: Ajax.ICatchErrorOptions): void;
    setLoading(loadingName: string | symbol): void;
    /** 将参数拼成 key1=val1&key2=val2 的格式 */
    private fillQueryParams;
    readonly stringifyParams: ({ params, paramsInOptions, method, encodeValue, cache, processData, }: Ajax.IStringifyParamsOptions) => {
        requestBody: string | Ajax.IParams | undefined;
        queryParams: string;
    };
    /** 移除缓存的 cancel 请求 */
    private removeCacheCancel;
    private getProcessedParams;
    responseEnd(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions, { success }: {
        success: any;
    }): void;
    /**
     * 发送请求
     */
    sendRequest<T>(props: {
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
    }): Promise<any>;
    /**
     * 发送请求
     */
    sendRequest<T>(
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
    cancelExecutor: Ajax.ICancelExecutor): Promise<any>;
    request<T = any>(method: Ajax.IMethod, url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions, loading?: boolean): Ajax.IRequestResult<T>;
    /** session 过期回调 */
    onSessionExpired<T = any>(error?: {
        errorCode: number;
        errorMsg: string;
    }, props?: Ajax.IRequestOptions): void;
    private getCacheKey;
    getCache<T = any>(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): T | undefined;
    getAllCache(): {
        [name: string]: any;
    };
    removeCache(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): void;
    clearCache(): void;
    clear(): void;
    /** 生成 cancel token */
    cancelToken(): string;
    /** cancel 请求 */
    cancel(token: string): void;
    /** 判断错误类型是否为取消请求 */
    isCancel(error: any): boolean;
    /** 配置 */
    config: (options?: {
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
        processData?: (params: Ajax.IParams, props: {
            method: Ajax.IMethod;
            url: string;
            options: Ajax.IOptions;
        }) => Ajax.IParams;
        /** 请求结束 */
        responseEnd?: (xhr?: XMLHttpRequest, _opts?: Ajax.IRequestOptions, props?: {
            success: boolean;
        }) => void;
        /** 捕获错误 */
        catchError?: (props: Ajax.ICatchErrorOptions) => void;
    }) => void;
}
export default AjaxBase;
