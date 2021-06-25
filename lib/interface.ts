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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    reject: IReject;
}

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

// session过期
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
    loading: boolean;
    resolve: IResolve;
    reject: IReject;
    onSessionExpired: IOnSessionExpired;
    options?: IOptions;
    cancelExecutor: ICancelExecutor;
    // 链路追踪ID
    xCorrelationID?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IOnSuccess<T = any> {
    (
        xhr: XMLHttpRequest | undefined,
        _opts: IRequestOptions,
        props: { response: IResult; options: IOptions; resolve: IResolve<T>; reject: IReject }
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
}

export type ICatchError = (props: ICatchErrorOptions) => void;

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
    beforeSend?: (props: { method: IMethod; url: string; params: IParams; options: IOptions }) => IRequestResult | void;
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
    /** 捕获错误 */
    catchError?: (props: ICatchErrorOptions) => void;
}

// Ajax
export interface IAjax {
    get: IRequest;
    put: IRequest;
    del: IRequest;
    post: IRequest;
    loadable: {
        get: IRequest;
        put: IRequest;
        del: IRequest;
        post: IRequest;
    };
    prefix: string;
    $loading: string;
    beforeSend: (props: { method: IMethod; url: string; params: IParams; options: IOptions }) => IRequestResult | void;
    processData: (
        params: IParams,
        props: { method: IMethod; url: string; options: IOptions; reject?: IReject }
    ) => IParams;
    processDataAfter: (
        params: IParams,
        props: { method: IMethod; url: string; options: IOptions; reject?: IReject; processData?: boolean }
    ) => IParams;
    processResponse: (response: IResult | null, props: IProcessResponseOptions) => IResult;
    readonly stringifyParams: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: { [name: string]: any } | string,
        method: IMethod,
        options?: IStringifyParamsOptions
    ) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: <T = any>(
        xhr: XMLHttpRequest | undefined,
        _opts: IRequestOptions,
        props: { response: IResult; options: IOptions; resolve: IResolve<T>; reject: IReject }
    ) => void;
    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processErrorResponse: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void | Promise<void>;
    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void;
    /** 捕获错误 */
    catchError: (props: {
        errorMsg: string;
        errorCode?: string | number;
        type?: 'uncaught' | 'log';
        remark?: string;
    }) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request<T = any>(
        method: IMethod,
        url: string,
        params: IParams | undefined,
        options?: IOptions,
        loading?: boolean,
        _opts?: IRequestOptions
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

// ----- signature end ------- //

// ----- loading start ------- //

export interface ILoading {
    start: () => void;
    finish: (num?: number) => void;
    count?: () => number;
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLoading?: () => any;
}

// ----- loading end ------- //
