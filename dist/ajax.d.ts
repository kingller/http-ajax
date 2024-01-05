import * as Ajax from './interface';
import AjaxBase from './base';
export declare class HttpAjax extends AjaxBase {
    onSuccess<T = any>(xhr: XMLHttpRequest, { response, options, resolve, reject, }: {
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
    }): void;
    /** 自定义错误处理（返回 false 则不再往下执行） */
    processError(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void | boolean;
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
