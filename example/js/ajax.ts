import ajax, { Ajax } from '../../lib/index';
import cryptoExtend from '../../lib//crypto-extend';
import signatureExtend from '../../lib/signature-extend';
import loadingExtend from '../../lib/loading-extend';

let refreshTokenPromise: Promise<any> = null;

ajax.config({
    /**
     * url前缀
     * @default '/api'
     */
    prefix: '/api',
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

// 添加显示loading扩展
ajax.extend(loadingExtend());

// 添加加解密扩展
ajax.extend(cryptoExtend());

// 添加签名扩展
ajax.extend(signatureExtend());

export default ajax;
