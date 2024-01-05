/* eslint-disable import/export */

export enum CODE {
    CANCEL = 'ECONNABORTED',
}

export enum METHODS {
    get = 'GET',
    post = 'POST',
    put = 'PUT',
    del = 'DELETE',
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onData?: (data: any) => void;
    /** 上传文件进度 */
    onProgress?: (e?: ProgressEvent) => void;
    /** 自定义响应数据 */
    transformResponse?: (
        /** 数据 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any,
        /** 响应头 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headers?: { [name: string]: any }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => any;
    /** 简单请求（不添加默认请求头，除了外部传入的） */
    simple?: boolean;
    /** 最大请求时间（毫秒），若超出该时间，请求会自动终止 */
    timeout?: number;
    /** 传入 query parameters，发送请求时拼接到 URL 上 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: { [name: string]: any };
    /** 自定义选项，用来传递值自定义处理逻辑 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: any;
}

// Promise resolve
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IResolve<T = any> = (value?: T | PromiseLike<T>) => void;
// Promise reject
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IReject = (reason?: any) => void;
// 取消请求
export type ICancelExecutor = (c: () => void) => void;

export interface IPromise<T> extends Promise<T> {
    cancel?: () => void;
}

// 请求参数
export type IParams =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { [name: string]: any }
    | string
    | Document
    | Blob
    | ArrayBufferView
    | ArrayBuffer
    | FormData
    | URLSearchParams
    | ReadableStream<Uint8Array>;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlParams: { [name: string]: any };
    params: IParams;
    paramsInOptions: IOptions['params'];
    /** 为 false 时不格式化请求参数 */
    processData?: boolean;
}

export interface IProcessParamsResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlParams: { [name: string]: any };
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

// 返回结果
export interface IResult {
    result?: boolean;
    errorCode?: string | number;
    errorMsg?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    confirmMsg?: string;
    warnMsg?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: any;
}

// 返回错误
export interface IError {
    name: string;
    message: string;
    stack?: string;
    errorCode?: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response?: any;
    isAjaxError?: boolean;
    toJSON: () => object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IRequestResult<T = any> = IPromise<T>;

/// 参数 *** url *** 请求地址
/// 参数 *** params *** 请求参数
/// 参数 *** options ***
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IRequest = <T = any>(url: string, params?: IParams, options?: IOptions) => IRequestResult<T>;

// session 过期
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IOnSessionExpired = <T = any>(
    error?: { errorCode: number; errorMsg: string },
    _opts?: IRequestOptions
) => void;

// 请求传递选项
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IOnSuccess<T = any> {
    (
        xhr: XMLHttpRequest | undefined,
        props: {
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
        }
    ): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { [name: string]: any } | string;
    /** 传入 query parameters，发送请求时拼接到 URL 上 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paramsInOptions?: { [name: string]: any } | string;
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
    processData?: (
        params: IParams,
        props: {
            method: IMethod;
            url: string;
            options: IOptions;
        }
    ) => IParams;
    /** 请求结束 */
    responseEnd?: (xhr?: XMLHttpRequest, _opts?: IRequestOptions, props?: { success: boolean }) => void;
    /** 捕获错误 */
    catchError?: (props: ICatchErrorOptions) => void;
}

// Ajax
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
    beforeSend: (props: {
        method: IMethod;
        url: string;
        params: IParams;
        options: IOptions;
        /** 是否显示 loading */
        loading?: boolean;
    }) => IRequestResult | void;
    processData: (
        params: IParams,
        props: { method: IMethod; url: string; options: IOptions; reject?: IReject }
    ) => IParams;
    processParams: (props: IProcessParamsOptions) => IProcessParamsResult;
    processParamsAfter: (props: IProcessParamsAfterOptions) => IProcessParamsAfterResult;
    processResponse: (response: IResult | null, props: IProcessResponseOptions) => IResult;
    readonly stringifyParams: (props: IStringifyParamsOptions) => {
        requestBody: string | IParams | undefined;
        queryParams: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: <T = any>(
        xhr: XMLHttpRequest | undefined,
        props: {
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
        }
    ) => void;
    /** 请求结束 */
    responseEnd?: (xhr?: XMLHttpRequest, _opts?: IRequestOptions, props?: { success: boolean }) => void;
    /**
     * 添加默认 AJAX 错误处理程序（请勿使用，内部扩展插件使用，外部请使用 onError）
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processErrorResponse: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void | Promise<void>;
    /** 添加默认 AJAX 错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request<T = any>(
        method: IMethod,
        url: string,
        params: IParams | undefined,
        options?: IOptions,
        loading?: boolean
    ): IRequestResult<T>;
    // prettier-ignore
    sendRequest: <T>(
        method:
        | IMethod
        | {
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
        },
        url?: string,
        params?: IParams | undefined,
        loading?: boolean,
        resolve?: IResolve<T>,
        reject?: IReject,
        onSessionExpired?: IOnSessionExpired,
        options?: IOptions,
        cancelExecutor?: ICancelExecutor
    ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise<any>;
    onSessionExpired: IOnSessionExpired;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCache: <T = any>(url: string, params: IParams | undefined, options?: IOptions) => T | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAllCache: () => { [name: string]: any };
    removeCache: (url: string, params: IParams | undefined, options?: IOptions) => void;
    clearCache: () => void;
    clear: () => void;
    cancelToken: () => string;
    cancel: (token: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isCancel: (error: { errorMsg: string; errorCode: string | number } | any) => boolean;
    setLoading: (loadingName: string | symbol) => void;
    /** 配置 */
    config: (options?: IConfigOptions) => void;
    Ajax: () => IAjax;
    /** 克隆 */
    clone: () => IAjax;
    /** 扩展 */
    extend: (pluginFunc: () => void) => void;
}

// ----- Crypto start ------- //

export interface ICryptoExtend {
    (): () => void;
}

// 密钥过期
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IOnCryptoExpired = <T = any>(
    error?: { errorCode: number; errorMsg: string },
    _opts?: IRequestOptions
) => void;

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

// ----- Crypto end ------- //

// ----- signature start ------- //

export interface ISignatureExtend {
    (): () => void;
}

export interface IOptions {
    /** 文件是否要签名 */
    isSignFile?: (file: File) => boolean;
}

// ----- signature end ------- //

// ----- loading start ------- //

export interface ILoading {
    start: () => void;
    finish: (num?: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: any;
}

// ----- loading end ------- //

/* eslint-enable import/export */
