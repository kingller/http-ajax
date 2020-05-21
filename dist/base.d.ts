import { ILoading } from './interface';
import * as Ajax from './interface';
declare class AjaxBase {
    _config: {
        noCache: boolean;
        statusField?: string;
    };
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
    beforeSend: (props: Ajax.IAjaxArgsOptions) => Ajax.IRequestResult | void;
    processData: (params: Ajax.IParams, props: Ajax.IAjaxProcessDataOptions) => Ajax.IParams;
    processResponse: (response: Ajax.IResult, props: Ajax.IProcessResponseOptions) => Ajax.IResult;
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
    setLoading(loadingName: string): void;
    getLoading(options: Ajax.IOptions): ILoading | undefined;
    readonly stringifyParams: (params: string | {
        [name: string]: any;
    }, method: Ajax.IMethod, options: Ajax.IOptions) => string;
    /** 移除缓存的cancel请求 */
    private removeCacheCancel;
    private getProcessedParams;
    sendRequest<T>(method: Ajax.IMethod, url: string, params: Ajax.IParams | undefined, loading: boolean, resolve: Ajax.IResolve<T>, reject: Ajax.IReject, onSessionExpired: Ajax.IOnSessionExpired, options: Ajax.IOptions, cancelExecutor: Ajax.ICancelExecutor): Promise<any>;
    private request;
    onSessionExpired<T = any>(error?: {
        errorCode: number;
        errorMsg: string;
    }, props?: Ajax.IRequestOptions): void;
    getCacheKey(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): string;
    removeCache(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): void;
    getCache<T = any>(url: string, params: Ajax.IParams | undefined, options?: Ajax.IOptions): T | undefined;
    getAllCache(): {
        [name: string]: any;
    };
    clearCache(): void;
    clear(): void;
    /** 生成cancel token */
    cancelToken(): string;
    /** cancel请求 */
    cancel(token: string): void;
    /** 判断错误类型是否为取消请求 */
    isCancel(error: any): boolean;
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
        onSessionExpired?: Ajax.IOnSessionExpired;
    }) => void;
}
export default AjaxBase;
