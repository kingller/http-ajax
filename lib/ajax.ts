import * as Ajax from './interface';
import AjaxBase from './base';
import { getResponseData } from './utils/response-data';

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.$feedback = window.$feedback || function (): void {};

export class HttpAjax extends AjaxBase {
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
            /** 链路追踪ID */
            xCorrelationID?: string;
        }
    ): void {
        const { statusField } = this._config;
        if (response && typeof response === 'object' && typeof response[statusField] !== 'undefined') {
            if (response[statusField]) {
                if (response.confirmMsg) {
                    delete response[statusField];
                    resolve(response as T);
                } else {
                    if (response.warnMsg) {
                        window.$feedback(response.warnMsg, 'warning');
                    }
                    resolve(response.data as T);
                }
            } else {
                reject(response);
                if (options && options.autoPopupErrorMsg === false) {
                    return;
                }
                window.$feedback(response.errorMsg);
            }
        } else {
            resolve(getResponseData<T>({ response, statusField }));
        }
    }

    /** 自定义错误处理（返回 false 则不再往下执行） */
    public processError(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | boolean {}

    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void {
        const error = {
            errorCode: xhr.status,
            errorMsg: xhr.statusText,
        };
        this.catchError({
            errorCode: error.errorCode,
            errorMsg: error.errorMsg,
            type: 'log',
            method: _opts.method,
            url: _opts.url,
            params: _opts.params,
            options: _opts.options,
            xCorrelationID: _opts.xCorrelationID,
            xhr,
        });
        if (this.processError(xhr, _opts) === false) {
            _opts.reject(xhr);
            return;
        }
        if (xhr.status === 401 || xhr.status === 406) {
            this.onSessionExpired<T>(error, _opts);
        } else {
            _opts.reject(xhr);
        }
    }

    public HttpAjax: typeof HttpAjax;

    public readonly Ajax = function (): Ajax.IAjax {
        return new HttpAjax();
    };

    public readonly clone = function (): Ajax.IAjax {
        const cloneAjax = new HttpAjax();
        const cloneFields = [
            'prefix',
            '$loading',
            'request',
            'beforeSend',
            'processData',
            'processParams',
            'processParamsAfter',
            'processResponse',
            'processError',
            'processErrorResponse',
            'responseEnd',
            'onSuccess',
            'onError',
            'onSessionExpired',
            'onCryptoExpired',
            'catchError',
            'clear',
            '_config',
            '_loadingExtendAdded',
            '_cryptoExtendAdded',
            '_snExtendAdded',
        ];
        for (const field of cloneFields) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (this as { [name: string]: any })[field] !== 'undefined') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (cloneAjax as { [name: string]: any })[field] = (this as { [name: string]: any })[field];
            }
        }
        return cloneAjax;
    };

    /** 密钥过期回调 */
    public onCryptoExpired?: Ajax.IOnCryptoExpired;

    /** 添加扩展 */
    public extend(pluginFunc: () => void): void {
        pluginFunc.apply(this);
    }
}

const ajax = new HttpAjax();
ajax.HttpAjax = HttpAjax;

export default ajax;
