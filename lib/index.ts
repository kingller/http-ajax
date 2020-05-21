'use strict';
import _ from 'lodash';
import * as Ajax from './interface';
import AjaxBase from './base';
import crypto from './extend/crypto';
import signature from './extend/signature';

// function onForbidden(): void {
//     window.$alert(i18next.t('confirm.forbidden'));
// }

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.$feedback = window.$feedback || function(): void {};

export class AjaxClass extends AjaxBase {
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
        if (response.result) {
            if (response.confirmMsg) {
                delete response.result;
                resolve(response as T);
            } else {
                if (response.warnMsg) {
                    window.$feedback(response.warnMsg, 'warning');
                }
                resolve(response.data as T);
            }
        } else if (response.result === false) {
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
        _opts.reject(xhr);
    }

    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // public onSessionExpired<T = any>(
    //     error?: { errorCode: number; errorMsg: string },
    //     props?: Ajax.IRequestOptions
    // ): void {
    //     const { method, url, params, loading, resolve, reject, options, cancelExecutor } = props;
    //     if (!window.unlock) {
    //         reject(error);
    //         return;
    //     }
    //     //当Session过期之后显示解锁对话框
    //     window.unlock.show((): void => {
    //         //解锁之后重新发送AJAX请求
    //         // prettier-ignore
    //         this.sendRequest<T>(
    //             method,
    //             url,
    //             params,
    //             loading,
    //             resolve,
    //             reject,
    //             window.unlock.logout,
    //             options,
    //             cancelExecutor
    //         );
    //     });
    // }

    public AjaxClass: typeof AjaxClass;

    public readonly Ajax = function(): Ajax.IAjax {
        return new AjaxClass();
    };
    
    public readonly clone = function(): Ajax.IAjax {
        const cloneAjax = new AjaxClass();
        const cloneFields = [
            'prefix',
            '$loading',
            'beforeSend',
            'processData',
            'processResponse',
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

const ajax = new AjaxClass();
ajax.AjaxClass = AjaxClass;

export default ajax;
