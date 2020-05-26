import ajax, { Ajax } from 'http-ajax';
import cryptoExtend from 'http-ajax/dist/crypto-extend';
import signatureExtend from 'http-ajax/dist/signature-extend';

ajax.config({
    /**
     * url前缀
     * @default '/api'
     */
    prefix: '/api',
    /**
     * 成功回调
     */
    onSuccess: <T = any>(
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
        }
    ): void => {
        // 处理成功回调
        // 下面是默认处理代码
        const { statusField } = ajax.getConfig();
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
    },
    /**
     * 失败回调
     */
    onError: <T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void => {
        // 处理错误回调
        // 下面是默认处理代码
        const error = {
            errorCode: xhr.status,
            errorMsg: xhr.statusText,
        };
        if (xhr.status === 401 || xhr.status === 406) {
            ajax.onSessionExpired<T>(error, _opts);
        } else {
            _opts.reject(xhr);
        }
    },
});

// 添加加解密扩展
ajax.extend(cryptoExtend());

// 添加签名扩展
ajax.extend(signatureExtend());

export default ajax;
