import * as Ajax from './interface';
import AjaxBase from './base';
export declare class AjaxClass extends AjaxBase {
    onSuccess<T = any>(xhr: XMLHttpRequest, { response, options, resolve, reject, }: {
        response: Ajax.IResult;
        options: Ajax.IOptions;
        resolve: Ajax.IResolve<T>;
        reject: Ajax.IReject;
    }): void;
    /** 添加默认AJAX错误处理程序 */
    onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void;
    AjaxClass: typeof AjaxClass;
    readonly Ajax: () => Ajax.IAjax;
    readonly clone: () => Ajax.IAjax;
    readonly cryptoExtend: Ajax.ICryptoExtend;
    onCryptoExpired?: Ajax.IOnCryptoExpired;
    readonly signatureExtend: Ajax.ISignatureExtend;
    extend(pluginFunc: () => void): void;
}
declare const ajax: AjaxClass;
export default ajax;
