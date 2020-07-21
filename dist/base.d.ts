import { ILoading } from './interface';
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
    $loading: string;
    /** 请求发送前 */
    beforeSend: (props: Ajax.IAjaxArgsOptions) => Ajax.IRequestResult | void;
    /** 数据处理 */
    processData: (params: Ajax.IParams, props: Ajax.IAjaxProcessDataOptions) => Ajax.IParams;
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
    }): void;
    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    processErrorResponse<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | Promise<void>;
    /** 添加默认AJAX错误处理程序 */
    onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void;
    /** 捕获错误 */
    catchError(props: Ajax.ICatchErrorOptions): void;
    setLoading(loadingName: string): void;
    /** 加载进度条 */
    getLoading(options: Ajax.IOptions): ILoading | undefined;
    readonly stringifyParams: (params: string | {
        [name: string]: any;
    }, method: Ajax.IMethod, options: Ajax.IStringifyParamsOptions) => string;
    /** 移除缓存的cancel请求 */
    private removeCacheCancel;
    private getProcessedParams;
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
    cancelExecutor: Ajax.ICancelExecutor): Promise<any>;
    request<T = any>(method: Ajax.IMethod, url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions, loading?: boolean): Ajax.IRequestResult<T>;
    /** session过期回调 */
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
    /** 生成cancel token */
    cancelToken(): string;
    /** cancel请求 */
    cancel(token: string): void;
    /** 判断错误类型是否为取消请求 */
    isCancel(error: any): boolean;
    /** 配置 */
    config: (options?: {
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
        processData?: (params: Ajax.IParams, props: {
            method: Ajax.IMethod;
            url: string;
            options: Ajax.IOptions;
        }) => Ajax.IParams;
        /** 捕获错误 */
        catchError?: (props: Ajax.ICatchErrorOptions) => void;
    }) => void;
}
export default AjaxBase;
