import _ from 'lodash';
import * as Ajax from '../interface';
import AjaxBase from './base';
import crypto from '../extend/crypto';
import signature from '../extend/signature';

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
        }: { response: Ajax.IResult; options: Ajax.IOptions; resolve: Ajax.IResolve<T>; reject: Ajax.IReject }
    ): void {
        const { statusField } = this._config;
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
        } else if (response[statusField] === false) {
            reject(response);
            if (options && options.autoPopupErrorMsg === false) {
                return;
            }
            window.$feedback(response.errorMsg);
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
            'beforeSend',
            'processData',
            'processResponse',
            'processErrorResponse',
            'onSuccess',
            'onError',
            'onSessionExpired',
            '_config',
        ];
        for (const field of cloneFields) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((this as { [name: string]: any })[field]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (cloneAjax as { [name: string]: any })[field] = (this as { [name: string]: any })[field];
            }
        }
        return cloneAjax;
    };

    public readonly cryptoExtend: Ajax.ICryptoExtend = crypto;

    public onCryptoExpired?: Ajax.IOnCryptoExpired;

    public readonly signatureExtend: Ajax.ISignatureExtend = signature;

    public extend(pluginFunc: () => void): void {
        pluginFunc.apply(this);
    }
}

const ajax = new HttpAjax();
ajax.HttpAjax = HttpAjax;

export default ajax;
