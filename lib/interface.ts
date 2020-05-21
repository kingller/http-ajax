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
    /** prefix: 设置url前缀 */
    prefix?: string;
    /** headers: 设置请求头 */
    headers?: {
        [name: string]: string;
    };
    /** loadingName: 使用当前loading名称来显示loading */
    loadingName?: string;
    /** context: 上下文，loading也可以从context.loading里取 */
    context?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [name: string]: any;
    };
    /** cancelToken: 可以根据该值cancel请求，相同的cancelToken会取消掉前一个请求 */
    cancelToken?: string;
}

export interface IOptions extends IOptionsBase {
    /** processData: 为false时不格式化请求参数 */
    processData?: boolean;
    /** json: 为false时不格式化返回值 */
    json?: boolean;
    /** autoPopupErrorMsg: 为false时，不弹出错误提示 */
    autoPopupErrorMsg?: boolean;
    /** responseType: 设置请求responseType */
    responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
    /** cache: 设置为true，缓存本次请求到的数据 */
    cache?: boolean | string;
    /** onData: 当陆陆续续获取数据片段时的回调函数 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onData?: (data: any) => void;
    /** onProgress: 上传文件进度 */
    onProgress?: (e?: ProgressEvent) => void;
    /** 自定义选项，用来传递值自定义处理逻辑 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: any;
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
}

export interface IProcessResponseOptions extends IAjaxArgsOptions {
    xhr: XMLHttpRequest;
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
    processData: (params: IParams, props: { method: IMethod; url: string; options: IOptions }) => IParams;
    processResponse: (response: IResult, props: IProcessResponseOptions) => IResult;
    readonly stringifyParams: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: { [name: string]: any } | string,
        method: IMethod,
        options?: IOptions
    ) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: <T = any>(
        xhr: XMLHttpRequest | undefined,
        props: { response: IResult; options: IOptions; resolve: IResolve<T>; reject: IReject }
    ) => void;
    /** 添加默认AJAX错误处理程序（请勿使用，内部扩展插件使用，外部请使用onError） */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processErrorResponse: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void;
    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: <T = any>(xhr: XMLHttpRequest, _opts: IRequestOptions) => void;
    sendRequest: <T>(
        method: IMethod,
        url: string,
        params: IParams | undefined,
        loading: boolean,
        resolve: IResolve<T>,
        reject: IReject,
        onSessionExpired: IOnSessionExpired,
        options: IOptions,
        cancelExecutor: ICancelExecutor
    ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise<any>;
    onSessionExpired: IOnSessionExpired;
    removeCache: (url: string, params: IParams | undefined, options?: IOptions) => void;
    clearCache: () => void;
    clear: () => void;
    cancelToken: () => string;
    cancel: (token: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isCancel: (error: { errorMsg: string; errorCode: string | number } | any) => boolean;
    setLoading: (loadingName: string) => void;
    config: (options: object) => void;
    Ajax: () => IAjax;
    clone: () => IAjax;
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
    /** 加密解密扩展 */
    readonly cryptoExtend?: ICryptoExtend;
    /** 密钥过期 */
    onCryptoExpired?: IOnCryptoExpired;
}

export interface IOptions {
    /** 加密字段 */
    encrypt?: 'all' | string[];
    /** 解密字段 */
    decrypt?: 'all' | string[];
}

// ----- Crypto end ------- //

// ----- signature start ------- //

export interface ISignatureExtend {
    (): () => void;
}

export interface IAjax {
    /** 签名扩展 */
    readonly signatureExtend?: ISignatureExtend;
}

// ----- signature end ------- //

// ----- loading start ------- //

export interface ILoading {
    start: () => void;
    finish: (num?: number) => void;
    count: () => number;
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLoading: () => any;
}

// ----- loading end ------- //
