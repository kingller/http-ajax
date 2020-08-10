import ajax, { Ajax } from 'http-ajax';
import cryptoExtend from 'http-ajax/dist/crypto-extend';
import signatureExtend from 'http-ajax/dist/signature-extend';
import { parseHeaders } from 'http-ajax/dist/utils/parseHeaders';

let refreshTokenPromise: Promise<any> = null;

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
        if (response && response[statusField]) {
            if (response.confirmMsg) {
                delete response[statusField];
                response = transformResponse({ response, options, xhr });
                resolve(response as T);
            } else {
                if (response.warnMsg) {
                    window.$feedback(response.warnMsg, 'warning');
                }
                response = transformResponse({ response: response.data, options, xhr });
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
    },
    /**
     * 失败回调
     */
    onError: <T = any>(xhr: XMLHttpRequest, _opts: Ajax.IRequestOptions): void => {
        // 处理错误回调
        const error = {
            errorCode: xhr.status,
            errorMsg: xhr.statusText,
        };
        ajax.catchError(
            Object.assign(
                {
                    remark: `ajax: ${_opts.method} ${_opts.url} params: ${JSON.stringify(_opts.params)}`,
                },
                error
            )
        );
        if (xhr.status === 401 || xhr.status === 406) {
            ajax.onSessionExpired<T>(error, _opts);
        } else if (xhr.status === 402) {
            // token过期，刷新token
            if (!refreshTokenPromise) {
                refreshTokenPromise = ajax.get('/cloud/rebuildToken', {
                    refreshToken: sessionStorage.getItem('refreshToken'),
                });
            }
            refreshTokenPromise
                .then((data) => {
                    refreshTokenPromise = null;
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('refreshToken', data.refreshToken);
                    // 刷新token后重新发送请求
                    ajax.sendRequest<T>(_opts);
                })
                .catch((e) => {
                    refreshTokenPromise = null;
                    _opts.reject(xhr);
                });
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
