export declare enum CODE {
    CANCEL = "ECONNABORTED"
}
export declare enum METHODS {
    get = "GET",
    post = "POST",
    put = "PUT",
    del = "DELETE"
}
export declare type IMethod = METHODS.get | METHODS.post | METHODS.put | METHODS.del;
export interface IOptionsBase {
    /** 设置url前缀 */
    prefix?: string;
    /** 设置请求头 */
    headers?: {
        [name: string]: string;
    };
    /** 使用当前loading名称来显示loading */
    loadingName?: string;
    /** 上下文，loading也可以从context.loading里取 */
    context?: {
        [name: string]: any;
    };
    /** 可以根据该值cancel请求，相同的cancelToken会取消掉前一个请求 */
    cancelToken?: string;
}
export interface IOptions extends IOptionsBase {
    /** 为false时不格式化请求参数 */
    processData?: boolean;
    /** 为false时不调用JSON.parse处理返回值 */
    json?: boolean;
    /** 为false时，不弹出错误提示 */
    autoPopupErrorMsg?: boolean;
    /** 设置请求responseType */
    responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
    /** 设置为true，缓存本次请求到的数据 */
    cache?: boolean | string;
    /** 当陆陆续续获取数据片段时的回调函数 */
    onData?: (data: any) => void;
    /** 上传文件进度 */
    onProgress?: (e?: ProgressEvent) => void;
    /** 自定义响应数据 */
    transformResponse?: (
    /** 数据 */
    data: any, 
    /** 响应头 */
    headers?: {
        [name: string]: any;
    }) => any;
    /** 自定义选项，用来传递值自定义处理逻辑 */
    [name: string]: any;
}
export declare type IResolve<T = any> = (value?: T | PromiseLike<T>) => void;
export declare type IReject = (reason?: any) => void;
export declare type ICancelExecutor = (c: () => void) => void;
export interface IPromise<T> extends Promise<T> {
    cancel?: () => void;
}
export declare type IParams = {
    [name: string]: any;
} | string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>;
export interface IAjaxArgsOptions {
    method: IMethod;
    url: string;
    params: IParams;
    options: IOptions;
}
export interface IAjaxProcessDataOptions {
    method: IMethod;
    url: string;
    options: IOptions;
    reject?: IReject;
}
export interface IAjaxProcessDataAfterOptions extends IAjaxProcessDataOptions {
    /** 为false时不格式化请求参数 */
    processData?: boolean;
}
export interface IProcessResponseOptions extends IAjaxArgsOptions {
    xhr: XMLHttpRequest;
    resolve: IResolve;
    reject: IReject;
    xCorrelationID: string;
}
export interface IResult {
    result?: boolean;
    errorCode?: string | number;
    errorMsg?: string;
    data?: any;
    confirmMsg?: string;
    warnMsg?: string;
    [name: string]: any;
}
export interface IError {
    name: string;
    message: string;
    stack?: string;
    errorCode?: string | number;
    request?: any;
    response?: any;
    isAjaxError?: boolean;
    toJSON: () => object;
}
export declare type IRequestResult<T = any> = IPromise<T>;
export declare type IRequest = <T = any>(url: string, params?: IParams, options?: IOptions) => IRequestResult<T>;
export declare type IOnSessionExpired = <T = any>(error?: {
    errorCode: number;
    errorMsg: string;
}, _opts?: IRequestOptions) => void;
export interface IRequestOptions {
    method: IMethod;
    url: string;
    params?: IParams;
    loading: boolean;
    resolve: IResolve;
    reject: IReject;
    onSessionExpired: IOnSessionExpired;
    options?: IOptions;
    cancelExecutor: ICancelExecutor;
    /** 链路追踪ID */
    xCorrelationID?: string;
    /** 请求开始时间 */
    startTime?: number;
}
export interface IOnSuccess<T = any> {
    (xhr: XMLHttpRequest | undefined, props: {
        response: IResult;
        options: IOptions;
        resolve: IResolve<T>;
        reject: IReject;
        /** method */
        method?: IMethod;
        /** url */
        url?: string;
        /** 请求参数 */
        params?: IParams | undefined;
        /** 链路追踪ID */
        xCorrelationID?: string;
    }): void;
}
export interface IOnError<T = any> {
    (xhr: XMLHttpRequest, _opts: IRequestOptions): void;
}
export interface ICatchErrorOptions {
    /** 错误消息 */
    errorMsg: string;
    /** 错误代码 */
    errorCode?: string | number;
    /** 类型 */
    type?: 'uncaught' | 'log';
    /** 备注 */
    remark?: string;
    /** method */
    method?: IMethod;
    /** url */
    url?: string;
    /** 请求参数 */
    params?: IParams | undefined;
    options?: IOptions;
    /** 链路追踪ID */
    xCorrelationID?: string;
    xhr?: XMLHttpRequest;
}
export declare type ICatchError = (props: ICatchErrorOptions) => void;
export interface IStringifyParamsOptions extends IOptions {
    /** GET请求时是否对值用encodeURIComponent编码（签名时使用，签名不对value编码。内部参数，请勿使用） */
    encodeValue?: boolean;
}
export interface IConfigOptions {
    /**
     * Get请求是否添加随机字符串阻止缓存
     * @default false
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
    onSuccess?: IOnSuccess;
    /**
     * 失败回调
     */
    onError?: IOnError;
    /**
     * session过期回调
     */
    onSessionExpired?: IOnSessionExpired;
    /**
     * 加载进度条
     */
    getLoading?: (options: IOptions) => ILoading;
    /**
     * 请求发送前
     */
    beforeSend?: (props: {
        method: IMethod;
        url: string;
        params: IParams;
        options: IOptions;
    }) => IRequestResult | void;
    /**
     * 数据处理
     */
    processData?: (params: IParams, props: {
        method: IMethod;
        url: string;
        options: IOptions;
    }) => IParams;
    /** 请求结束 */
    responseEnd?: (xhr?: XMLHttpRequest, _opts?: IRequestOptions, props?: {
        success: boolean;
    }) => void;
    /** 捕获错误 */
    catchError?: (props: ICatchErrorOptions) => void;
}
export interface IAjax {
    readonly get: IRequest;
    readonly put: IRequest;
    readonly del: IRequest;
    readonly post: IRequest;
    readonly loadable: {
        get: IRequest;
        put: IRequest;
        del: IRequest;
        post: IRequest;
    };
    prefix: string;
    $loading: string;
    beforeSend: (props: {
        method: IMethod;
        url: string;
        params: IParams;
        options: IOptions;
    }) => IRequestResult | void;
    processData: (params: IParams, props: {
        method: IMethod;
        url: string;
        options: IOptions;
        reject?: IReject;
    }) => IParams;
    processDataAfter: (params: IParams, props: {
        method: IMethod;
        url: string;
        options: IOptions;
        reject?: IReject;
        processData?: boolean;
    }) => Promise<IParams>;
    processResponse: (response: IResult | null, props: IProcessResponseOptions) => Promise<IResult>;
    readonly stringifyParams: (params: {
        [name: string]: any;
    } | string, method: IMethod, options?: IStringifyParamsOptions) => string;
    onSuccess: <T = any>(xhr: XMLHttpRequest | undefined, props: {
        response: IResult;
        options: IOptions;
        resolve: IResolve<T>;
        reject: IReject;
        /** method */
        method?: IMethod;
        /** url */
        url?: string;
        /** 请求参数 */
        params?: IParams | undefined;
        /** 链路追踪ID */
        xCorrelationID?: string;
    }) => void;
    /** 请求结束 */
    responseEnd?: (xhr?: XMLHttpRequest, _opts?: IRequestOptions, props?: {
        success: boolean;
    }) => void;
    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    processErrorResponse: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void | Promise<void>;
    /** 添加默认AJAX错误处理程序 */
    onError: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void;
    /** 捕获错误 */
    catchError: (props: {
        /** 错误消息 */
        errorMsg: string;
        /** 错误代码 */
        errorCode?: string | number;
        /** 类型 */
        type?: 'uncaught' | 'log';
        /** 备注 */
        remark?: string;
        /** method */
        method?: IMethod;
        /** url */
        url?: string;
        /** 请求参数 */
        params?: IParams | undefined;
        options?: IOptions;
        /** 链路追踪ID */
        xCorrelationID?: string;
        xhr?: XMLHttpRequest;
    }) => void;
    request<T = any>(method: IMethod, url: string, params: IParams | undefined, options?: IOptions, loading?: boolean): IRequestResult<T>;
    sendRequest: <T>(method: IMethod | {
        /** method */
        method: IMethod;
        /** url */
        url: string;
        /** 请求参数 */
        params?: IParams | undefined;
        /** 是否显示loading */
        loading: boolean;
        /** resolve */
        resolve: IResolve<T>;
        /** reject */
        reject: IReject;
        /** options */
        options?: IOptions;
        /** 取消请求方法 */
        cancelExecutor: ICancelExecutor;
        /** 请求session过期回调 */
        onSessionExpired?: IOnSessionExpired;
    }, url?: string, params?: IParams | undefined, loading?: boolean, resolve?: IResolve<T>, reject?: IReject, onSessionExpired?: IOnSessionExpired, options?: IOptions, cancelExecutor?: ICancelExecutor) => Promise<any>;
    onSessionExpired: IOnSessionExpired;
    getCache: <T = any>(url: string, params: IParams | undefined, options?: IOptions) => Promise<T | undefined>;
    getAllCache: () => {
        [name: string]: any;
    };
    removeCache: (url: string, params: IParams | undefined, options?: IOptions) => void;
    clearCache: () => void;
    clear: () => void;
    cancelToken: () => string;
    cancel: (token: string) => void;
    isCancel: (error: {
        errorMsg: string;
        errorCode: string | number;
    } | any) => boolean;
    setLoading: (loadingName: string) => void;
    /**
     * 加载进度条
     */
    getLoading?: (options: IOptions) => ILoading;
    /** 配置 */
    config: (options?: IConfigOptions) => void;
    Ajax: () => IAjax;
    /** 克隆 */
    clone: () => IAjax;
    /** 扩展 */
    extend: (pluginFunc: () => void) => void;
}
export interface ICryptoExtend {
    (): () => void;
}
export declare type IOnCryptoExpired = <T = any>(error?: {
    errorCode: number;
    errorMsg: string;
}, _opts?: IRequestOptions) => void;
export interface IAjax {
    /** 密钥过期回调 */
    onCryptoExpired?: IOnCryptoExpired;
}
export interface IOptions {
    /** 加密字段 */
    encrypt?: 'all' | string[];
    /** 解密字段（该字段暂不使用，目前请求解密是通过请求响应头传递加密字段来解密的） */
    decrypt?: 'all' | string[];
}
export interface ISignatureExtend {
    (): () => void;
}
export interface ILoading {
    start: () => void;
    finish: (num?: number) => void;
    count?: () => number;
    name?: string;
    getLoading?: () => any;
}
