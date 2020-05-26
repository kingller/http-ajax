import * as Ajax from './interface';
import AjaxBase from './base';
export declare class HttpAjax extends AjaxBase {
    onSuccess<T = any>(xhr: XMLHttpRequest, { response, options, resolve, reject, }: {
        response: Ajax.IResult;
        options: Ajax.IOptions;
        resolve: Ajax.IResolve<T>;
        reject: Ajax.IReject;
    }): void;
    /** 添加默认AJAX错误处理程序 */
    onError<T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void;
    HttpAjax: typeof HttpAjax;
    readonly Ajax: () => Ajax.IAjax;
    readonly clone: () => Ajax.IAjax;
    /** 密钥过期回调 */
    onCryptoExpired?: Ajax.IOnCryptoExpired;
    /** 添加扩展 */
    extend(pluginFunc: () => void): void;
}
declare const ajax: HttpAjax;
export default ajax;
