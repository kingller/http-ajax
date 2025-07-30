export declare enum CODE {
    CANCEL = "ECONNABORTED"
}
export declare enum METHODS {
    get = "GET",
    post = "POST",
    put = "PUT",
    del = "DELETE"
}
export type IMethod = METHODS.get | METHODS.post | METHODS.put | METHODS.del;
export interface IOptionsBase {
    /** 设置 url 前缀 */
    prefix?: string;
    /** 设置请求头 */
    headers?: {
        [name: string]: string;
    };
    /** 使用当前 loading 名称来显示 loading */
    loadingName?: string | symbol;
    /** 上下文，loading 也可以从 context.loading 里取 */
    context?: {
        [name: string]: any;
    };
    /** 可以根据该值 cancel 请求，相同的 cancelToken 会取消掉前一个请求 */
    cancelToken?: string;
}
export interface IOptions extends IOptionsBase {
    /** 为 false 时不格式化请求参数 */
    processData?: boolean;
    /** 为 false 时不调用 JSON.parse 处理返回值 */
    json?: boolean;
    /** 为 false 时，不弹出错误提示 */
    autoPopupErrorMsg?: boolean;
    /** 设置请求 responseType */
    responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
    /** 设置为 true，缓存本次请求到的数据 */
    cache?: boolean | string;
    /** 当陆陆续续获取数据片段时的回调函数 */
    onData?: (data: any, options?: {
        correlationId: string;
    }) => void;
    /**
     * 是否对 onData 的数据自动执行 JSON.parse，默认 true。
     * 为 false 时，onData 回调会收到原始字符串。
     */
    parseData?: boolean;
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
    /** 简单请求（不添加默认请求头，除了外部传入的） */
    simple?: boolean;
    /** 最大请求时间（毫秒），若超出该时间，请求会自动终止 */
    timeout?: number;
    /** 传入 query parameters，发送请求时拼接到 URL 上 */
    params?: {
        [name: string]: any;
    };
    /** 自定义选项，用来传递值自定义处理逻辑 */
    [name: string]: any;
}
export type IResolve<T = any> = (value?: T | PromiseLike<T>) => void;
export type IReject = (reason?: any) => void;
export type ICancelExecutor = (c: () => void) => void;
export interface IPromise<T> extends Promise<T> {
    cancel?: () => void;
}
export type IParams = {
    [name: string]: any;
} | string | Document | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>;
export interface IAjaxArgsOptions {
    method: IMethod;
    url: string;
    params: IParams;
    options: IOptions;
    /** 是否显示 loading */
    loading?: boolean;
}
export interface IAjaxProcessDataOptions {
    method: IMethod;
    url: string;
    options: IOptions;
    reject?: IReject;
}
export interface IProcessParamsOptions extends IAjaxProcessDataOptions {
    urlParams: {
        [name: string]: any;
    };
    params: IParams;
    paramsInOptions: IOptions['params'];
    /** 为 false 时不格式化请求参数 */
    processData?: boolean;
}
export interface IProcessParamsResult {
    urlParams: {
        [name: string]: any;
    };
    params: IParams;
    paramsInOptions: IOptions['params'] | string;
}
export interface IProcessParamsAfterOptions extends IAjaxProcessDataOptions {
    params: IParams;
    paramsInOptions: IOptions['params'] | string;
    /** 为 false 时不格式化请求参数 */
    processData?: boolean;
}
export type IProcessParamsAfterResult = void | Promise<void>;
export type IProcessResponseOptions = {
    xhr: XMLHttpRequest;
    resolve: IResolve;
    reject: IReject;
    xCorrelationID: string;
} & Omit<IAjaxArgsOptions, 'loading'>;
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
export type IRequestResult<T = any> = IPromise<T>;
export type IRequest = <T = any>(url: string, params?: IParams, options?: IOptions) => IRequestResult<T>;
export type IOnSessionExpired = <T = any>(error?: {
    errorCode: number;
    errorMsg: string;
}, _opts?: IRequestOptions) => void;
export interface IRequestOptions {
    method: IMethod;
    url: string;
    params?: IParams;
    /** 是否显示 loading */
    loading: boolean;
    resolve: IResolve;
    reject: IReject;
    onSessionExpired: IOnSessionExpired;
    options?: IOptions;
    cancelExecutor: ICancelExecutor;
    /** 链路追踪 ID */
    xCorrelationID?: string;
    /** 请求开始时间 */
    startTime?: number;
    /**
     * @private 第几次重试（内部变量）
     */
    _retryTimes?: number;
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
        /** 链路追踪 ID */
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
    /** 链路追踪 ID */
    xCorrelationID?: string;
    xhr?: XMLHttpRequest;
}
export type ICatchError = (props: ICatchErrorOptions) => void;
export interface IStringifyParamsOptions {
    params: {
        [name: string]: any;
    } | string;
    /** 传入 query parameters，发送请求时拼接到 URL 上 */
    paramsInOptions?: {
        [name: string]: any;
    } | string;
    /** method */
    method: IMethod;
    /** GET 请求时是否对值用 encodeURIComponent 编码（签名时使用，签名不对 value 编码。内部参数，请勿使用） */
    encodeValue?: boolean;
    /** 设置为 true，缓存本次请求到的数据 */
    cache?: IOptions['cache'];
    /** 为 false 时不格式化请求参数 */
    processData?: IOptions['processData'];
}
export interface IConfigOptions {
    /**
     * Get 请求是否添加随机字符串阻止缓存
     * @default false
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
    onSuccess?: IOnSuccess;
    /**
     * 失败回调
     */
    onError?: IOnError;
    /**
     * session 过期回调
     */
    onSessionExpired?: IOnSessionExpired;
    /**
     * 请求发送前
     */
    beforeSend?: (props: {
        method: IMethod;
        url: string;
        params: IParams;
        options: IOptions;
        /** 是否显示 loading */
        loading?: boolean;
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
    /** 修改请求配置 */
    transformRequest?: (props: IAjaxArgsOptions) => IAjaxArgsOptions;
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
    $loading: string | symbol;
    transformRequest: (props: IAjaxArgsOptions) => IAjaxArgsOptions;
    beforeSend: (props: {
        method: IMethod;
        url: string;
        params: IParams;
        options: IOptions;
        /** 是否显示 loading */
        loading?: boolean;
    }) => IRequestResult | void;
    processData: (params: IParams, props: {
        method: IMethod;
        url: string;
        options: IOptions;
        reject?: IReject;
    }) => IParams;
    processParams: (props: IProcessParamsOptions) => IProcessParamsResult;
    processParamsAfter: (props: IProcessParamsAfterOptions) => IProcessParamsAfterResult;
    processResponse: (response: IResult | null, props: IProcessResponseOptions) => IResult;
    readonly stringifyParams: (props: IStringifyParamsOptions) => {
        requestBody: string | IParams | undefined;
        queryParams: string;
    };
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
        /** 链路追踪 ID */
        xCorrelationID?: string;
    }) => void;
    /** 请求结束 */
    responseEnd?: (xhr?: XMLHttpRequest, _opts?: IRequestOptions, props?: {
        success: boolean;
    }) => void;
    /**
     * 添加默认 AJAX 错误处理程序（请勿使用，内部扩展插件使用，外部请使用 onError）
     * @private
     */
    processErrorResponse: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void | Promise<void>;
    /** 添加默认 AJAX 错误处理程序 */
    onError: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void;
    /** 自定义错误处理（返回 false 则不再往下执行） */
    processError: (xhr: XMLHttpRequest, _opts: IRequestOptions) => void | boolean;
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
        /** 链路追踪 ID */
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
        /** 是否显示 loading */
        loading: boolean;
        /** resolve */
        resolve: IResolve<T>;
        /** reject */
        reject: IReject;
        /** options */
        options?: IOptions;
        /** 取消请求方法 */
        cancelExecutor: ICancelExecutor;
        /** 请求 session 过期回调 */
        onSessionExpired?: IOnSessionExpired;
    }, url?: string, params?: IParams | undefined, loading?: boolean, resolve?: IResolve<T>, reject?: IReject, onSessionExpired?: IOnSessionExpired, options?: IOptions, cancelExecutor?: ICancelExecutor) => Promise<any>;
    onSessionExpired: IOnSessionExpired;
    getCache: <T = any>(url: string, params: IParams | undefined, options?: IOptions) => T | undefined;
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
    setLoading: (loadingName: string | symbol) => void;
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
export type IOnCryptoExpired = <T = any>(error?: {
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
export interface IOptions {
    /** 文件是否要签名 */
    isSignFile?: (file: File) => boolean;
}
export interface ILoadingOptions {
    estimatedDuration?: number;
}
export interface ILoading {
    start: (options?: ILoadingOptions) => void;
    finish: (num?: number) => void;
    [name: string]: any;
}
