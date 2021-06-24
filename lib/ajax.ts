import * as Ajax from './interface';
import AjaxBase from './base';

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.$feedback = window.$feedback || function (): void {};

export class HttpAjax extends AjaxBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onSuccess<T = any>(
        xhr: XMLHttpRequest,
        _opts: Ajax.IRequestOptions,
        {
            response,
            options,
            resolve,
            reject,
        }: { response: Ajax.IResult; options: Ajax.IOptions; resolve: Ajax.IResolve<T>; reject: Ajax.IReject }
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
            resolve(response as T);
        }
    }

    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void {
        const error = {
            errorCode: xhr.status,
            errorMsg: xhr.statusText,
        };
        this.catchError({
            remark: `ajax: ${_opts.method} ${_opts.url} params: ${JSON.stringify(_opts.params)}`,
            errorCode: error.errorCode,
            errorMsg: error.errorMsg,
        });
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
            'processDataAfter',
            'processResponse',
            'processErrorResponse',
            'onSuccess',
            'onError',
            'onSessionExpired',
            'onCryptoExpired',
            'getLoading',
            'catchError',
            'clear',
            '_config',
            '_cryptoExtendAdded',
            '_signatureExtendAdded',
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
