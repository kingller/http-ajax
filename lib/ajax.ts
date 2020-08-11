import * as Ajax from './interface';
import AjaxBase from './base';
import { parseHeaders } from './utils/parseHeaders';

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.$feedback = window.$feedback || function (): void {};

function transformResponse({
    response,
    options,
    xhr,
}: {
    response: Ajax.IResult;
    options?: Ajax.IOptions;
    xhr?: XMLHttpRequest;
}): Ajax.IResult {
    if (options && options.transformResponse) {
        let responseHeaders = xhr ? parseHeaders(xhr.getAllResponseHeaders()) : undefined;
        return options.transformResponse(response, responseHeaders);
    } else {
        return response;
    }
}

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
        if (response && response[statusField]) {
            if (response.confirmMsg) {
                delete response[statusField];
                response = transformResponse({ response, options, xhr });
                resolve(response as T);
            } else {
                if (response.warnMsg) {
                    window.$feedback(response.warnMsg, 'warning');
                }
                response.data = transformResponse({ response: response.data, options, xhr });
                resolve(response.data as T);
            }
        } else if (response && response[statusField] === false) {
            reject(response);
            if (options && options.autoPopupErrorMsg === false) {
                return;
            }
            window.$feedback(response.errorMsg);
        } else {
            response = transformResponse({ response, options, xhr });
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
            'beforeSend',
            'processData',
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
