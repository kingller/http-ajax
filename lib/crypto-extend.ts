import _, { lowerFirst } from 'lodash';
import Crypto from 'client-crypto';
import storage from './utils/storage';
import { STORAGE_KEY } from './utils/enums';
import { cloneDeep } from './utils/clone';
import { isArray } from './utils/array';
import { promisify } from './utils/promise';
import { catchAjaxError } from './utils/catch';
import { getResponseData, setResponseData } from './utils/response-data';
import {
    IAjax,
    IAjaxArgsOptions,
    IAjaxProcessDataOptions,
    IRequestResult,
    IParams,
    IOptions,
    IResult,
    IRequestOptions,
    IProcessResponseOptions,
} from './interface';
import { Ajax } from '.';

interface IPublicKeyResponse {
    publicKey: string;
    uuid: string;
}

type IEncryptFields = 'all' | string[] | undefined;

let publicKeyPromise: IRequestResult<IPublicKeyResponse> = null;
let secretKeyPromise: IRequestResult<void> = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let waitingPublicKeyPromise: { resolve: () => void; reject: (e?: any) => void }[] = [];

/**
 * 加解密扩展。
 * 加密请求前未获取到密钥或返回 470 状态时，首先发送请求/api/encryption/public-key 获取服务端 RSA 公钥。
 * 客户端生成 AES 密钥，并使用 RSA 加密后发送请求/api/encryption/token 传输给服务端，服务端客户端使用该密钥加解密。
 * 请求头中将会添加字段 uuid，encrypt（uuid:唯一标识码，服务端根据该 uuid 获取密钥；encrypt：加密字段，服务端根据该字段解密）。
 * 解密请求将会在响应头中添加字段 encrypt：加密字段，客户端根据该字段解密。
 */
function cryptoExtend(): () => void {
    (function (): void {
        const secretKey = storage.getItem(STORAGE_KEY.SECRET_KEY, 'session') as string;
        if (secretKey) {
            Crypto.AES.setKey(window.atob(secretKey));
        }
    })();

    return function crypto(): void {
        const { beforeSend, processData, processResponse, processErrorResponse, clear } = this as IAjax;

        // 校验该扩展是否已添加过
        if (this._cryptoExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `cryptoExtend` can only be added to ajax once!');
        } else {
            // 校验加密扩展必须在签名扩展前添加
            if (this._signatureExtendAdded) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                console && console.warn('Warning: `cryptoExtend` should be added to ajax before `signatureExtend`!');
            }
        }

        // 添加标志符用来校验该扩展是否已添加
        this._cryptoExtendAdded = true;

        function hasSecretKey(): boolean {
            return !!storage.getItem(STORAGE_KEY.SECRET_KEY, 'session');
        }

        function getUuid(): string {
            return storage.getItem(STORAGE_KEY.UUID, 'session') as string;
        }

        function getPublicKey(): Promise<IPublicKeyResponse> {
            // 从服务端获取公钥
            publicKeyPromise = (this as IAjax).get<IPublicKeyResponse>('/encryption/public-key');
            return new Promise((resolve, reject) => {
                publicKeyPromise
                    .then(function (data) {
                        publicKeyPromise = null;
                        return resolve(data);
                    })
                    .catch(function (e) {
                        publicKeyPromise = null;
                        waitingPublicKeyPromise.forEach(function (p) {
                            p.reject(e);
                        });
                        waitingPublicKeyPromise = [];
                        reject(e);
                    });
            });
        }

        function sendSecretKeyRequest(): Promise<void> {
            return getPublicKey.apply(this).then((publicKeyResponse: IPublicKeyResponse) => {
                // 生成 AES 秘钥
                const newSecretKey = Crypto.AES.createKey();
                // 使用 RSA 公钥加密秘钥
                const encryptedSecretKey = Crypto.RSA.encrypt(newSecretKey, publicKeyResponse.publicKey);
                // 将加密后的秘钥传输给服务器端
                secretKeyPromise = new Promise((resolve, reject) => {
                    (this as IAjax)
                        .post(
                            '/encryption/token',
                            { token: encryptedSecretKey },
                            {
                                headers: {
                                    uuid: publicKeyResponse.uuid,
                                },
                            }
                        )
                        .then(function () {
                            if (!window.btoa) {
                                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                console && console.error('`window.btoa` is undefined');
                            }
                            storage.setItem(STORAGE_KEY.SECRET_KEY, window.btoa(newSecretKey), 'session');
                            storage.setItem(STORAGE_KEY.UUID, publicKeyResponse.uuid, 'session');
                            waitingPublicKeyPromise.forEach(function (p) {
                                p.resolve();
                            });
                            waitingPublicKeyPromise = [];
                            resolve();
                        })
                        .catch(function (e) {
                            waitingPublicKeyPromise.forEach(function (p) {
                                p.reject(e);
                            });
                            waitingPublicKeyPromise = [];
                            reject(e);
                        });
                });
                return secretKeyPromise;
            });
        }

        function createSecretKey(): Promise<void> {
            if (!hasSecretKey()) {
                if (secretKeyPromise) {
                    return secretKeyPromise;
                }
                if (publicKeyPromise) {
                    return new Promise(function (resolve, reject) {
                        waitingPublicKeyPromise.push({ resolve, reject });
                    });
                }
                return new Promise((resolve, reject) => {
                    (sendSecretKeyRequest.apply(this) as IRequestResult<void>)
                        .then(function () {
                            secretKeyPromise = null;
                            resolve();
                        })
                        .catch(function (e) {
                            secretKeyPromise = null;
                            reject();
                        });
                });
            }
            return Promise.resolve();
        }

        function encryptOrDecryptDataArrayField(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { [name: string]: any } | any[],
            fieldPaths: string[],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            encryptOrDecryptFuc: (data: any) => any
        ): void {
            let currentData = data;
            for (let index = 0; index < fieldPaths.length; index++) {
                if (!currentData || typeof currentData !== 'object') {
                    break;
                }
                const fieldName = fieldPaths[index];
                if (!fieldName) {
                    continue;
                }
                // eslint-disable-next-line no-template-curly-in-string
                if (fieldName === '${index}') {
                    if (!isArray(currentData)) {
                        break;
                    }
                }
                if (index === fieldPaths.length - 1) {
                    // eslint-disable-next-line no-template-curly-in-string
                    if (fieldName === '${index}') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-loop-func
                        (currentData as any[]).forEach((v, i) => {
                            if (typeof v !== 'undefined') {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (currentData as any[])[i] = encryptOrDecryptFuc(v);
                            }
                        });
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const value = (currentData as { [name: string]: any })[fieldName];
                        if (typeof value !== 'undefined') {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (currentData as { [name: string]: any })[fieldName] = encryptOrDecryptFuc(value);
                        }
                    }
                    return;
                }
                // eslint-disable-next-line no-template-curly-in-string
                if (fieldName === '${index}') {
                    const restFieldPaths = fieldPaths.slice(index + 1);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (currentData as any[]).forEach((d) => {
                        encryptOrDecryptDataArrayField(d, restFieldPaths, encryptOrDecryptFuc);
                    });
                    break;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    currentData = (currentData as { [name: string]: any })[fieldName];
                }
            }
        }

        function encryptOrDecryptDataField(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { [name: string]: any } | any[],
            filed: string,
            type: 'encrypt' | 'decrypt'
        ): void {
            if (!filed || !data) {
                return;
            }
            const encryptOrDecryptFuc = type === 'encrypt' ? Crypto.AES.encrypt : Crypto.AES.decrypt;
            if (/\$\{index\}(\.|$)/.test(filed)) {
                // 需要遍历数组加密
                const fieldPaths = filed.split('.');
                encryptOrDecryptDataArrayField(data, fieldPaths, encryptOrDecryptFuc);
            } else {
                let value = _.get(data, filed);
                if (typeof value !== 'undefined') {
                    value = encryptOrDecryptFuc(value);
                    _.set(data, filed, value);
                }
            }
        }

        /** 字段加密 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function encryptDataField(data: { [name: string]: any }, filed: string): void {
            encryptOrDecryptDataField(data, filed, 'encrypt');
        }

        /** 字段解密 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function decryptDataField(data: { [name: string]: any } | any[], filed: string): void {
            encryptOrDecryptDataField(data, filed, 'decrypt');
        }

        function clearCrypto(): void {
            storage.removeItem(STORAGE_KEY.SECRET_KEY, 'session');
            storage.removeItem(STORAGE_KEY.UUID, 'session');
            Crypto.AES.clearKey();
            publicKeyPromise = null;
            secretKeyPromise = null;
            waitingPublicKeyPromise = [];
        }

        (this as IAjax).beforeSend = (props: IAjaxArgsOptions): IRequestResult | void => {
            let promise: IRequestResult | void;
            if (beforeSend) {
                promise = beforeSend(props);
            }
            promise = promisify(promise);
            const { options } = props;
            const uuid = getUuid();
            // 由于解密需要服务端返回响应头才知道，故统一添加唯一标志符 uuid，服务端将根据 uuid 取得 AES 密钥
            if (uuid) {
                _.merge(options, {
                    headers: {
                        uuid,
                    },
                });
            }
            // 解密的不会传 options.decrypt，这里只是提供了手动指定 decrypt 功能
            // 解密需去响应头获取 encrypt 字段，响应头返回前不知道该请求是需解密请求，所以解密请求需在 470 之后生成 AES 密钥并传输给服务端
            // 加密请求则根据 options.encrypt，如果没有 AES 密钥，则生成并传输给服务端
            if (options && (options.encrypt || options.decrypt)) {
                return promise.then(() => {
                    return createSecretKey.apply(this).then(() => {
                        _.merge(options, {
                            headers: {
                                uuid: getUuid(),
                            },
                        });
                        if (options.encrypt) {
                            _.merge(options, {
                                headers: {
                                    // 传输加密字段给服务端，服务端将根据该字段解密
                                    encrypt: JSON.stringify(options.encrypt),
                                },
                            });
                        }
                        return Promise.resolve();
                    });
                });
            }
            return promise;
        };

        (this as IAjax).encryptUrlParams = (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            urlParams: { [name: string]: any },
            encrypt: string[] | 'all'
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ): { [name: string]: any } => {
            const paramsName = _.keys(urlParams);
            _.forEach(paramsName, (field) => {
                if (encrypt === 'all') {
                    encryptDataField(urlParams, field);
                } else {
                    if (_.includes(encrypt, field)) {
                        encryptDataField(urlParams, field);
                    }
                }
            });

            return urlParams;
        };

        (this as IAjax).processData = (
            params: IParams,
            props: IAjaxProcessDataOptions
        ): { params: IParams; options: IOptions } => {
            params = processData(params, props).params;
            const { reject, method } = props;
            let { options } = props;
            try {
                if ((params || options.params) && options && options.encrypt) {
                    params = cloneDeep(params);
                    options = cloneDeep(options);
                    if (options.encrypt === 'all') {
                        if (method === Ajax.METHODS.get) {
                            params = _.merge(params, options.params);
                            delete options.params;
                        } else {
                            options.params = Crypto.AES.encrypt(options.params);
                        }
                        params = Crypto.AES.encrypt(params);
                        return { params, options };
                    }
                    if (typeof options.params !== 'object' && typeof params !== 'object') {
                        return { params, options };
                    }
                    if (Array.isArray(options.encrypt)) {
                        options.encrypt.forEach((field) => {
                            if (_.has(params, field)) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                encryptDataField(params as { [name: string]: any }, field);
                            }
                            if (_.has(options.params, field)) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                encryptDataField(options.params as { [name: string]: any }, field);
                            }
                        });
                    }
                }
            } catch (e) {
                if (reject) reject(e);
                catchAjaxError({
                    e,
                    method: props.method,
                    url: props.url,
                    params,
                    callback: (this as IAjax).catchError,
                    type: reject ? 'log' : 'uncaught',
                    options,
                });
            }
            return { params, options };
        };

        (this as IAjax).processResponse = (response: IResult | null, props: IProcessResponseOptions): IResult => {
            response = processResponse(response, props);
            if (response === null) {
                return response;
            }
            const { options } = props;
            try {
                let decrypt: IEncryptFields = (options && options.decrypt) || undefined;
                if (!decrypt) {
                    const { xhr } = props;
                    let encryptResHeader = '';
                    // Fixed `Refused to get unsafe header "encrypt"`
                    if (xhr.getAllResponseHeaders().indexOf('encrypt') >= 0) {
                        encryptResHeader = xhr.getResponseHeader('encrypt');
                    }
                    if (encryptResHeader) {
                        decrypt = JSON.parse(encryptResHeader);
                    }
                }
                if (decrypt) {
                    const { statusField } = this._config;
                    let data = getResponseData({ response, statusField });

                    if (decrypt === 'all') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        data = Crypto.AES.decrypt(data as any as string);
                    } else {
                        if (!data || typeof data !== 'object') {
                            return response;
                        }
                        if (Array.isArray(decrypt)) {
                            decrypt.forEach((field) => {
                                decryptDataField(data, field);
                            });
                        }
                    }

                    response = setResponseData({ response, data, statusField });
                }
            } catch (e) {
                props.reject(e);
                catchAjaxError({
                    e,
                    method: props.method,
                    url: props.url,
                    params: props.params,
                    callback: (this as IAjax).catchError,
                    type: 'log',
                    options,
                    xCorrelationID: props.xCorrelationID,
                    xhr: props.xhr,
                });
            }
            return response;
        };

        (this as IAjax).clear = (): void => {
            clear();
            clearCrypto();
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as IAjax).onCryptoExpired = <T = any>(
            error?: { errorCode: number; errorMsg: string },
            _opts?: IRequestOptions
        ): void => {
            if (!publicKeyPromise && !secretKeyPromise) {
                clearCrypto();
            }
            // 解密需去响应头获取 encrypt 字段，响应头返回前不知道该请求是需解密请求，所以解密请求需在 470 之后生成 AES 密钥并传输给服务端
            createSecretKey.apply(this).then(
                () => {
                    const { method, url, params, loading, resolve, reject, options, cancelExecutor } = _opts;
                    // prettier-ignore
                    (this as IAjax).sendRequest<T>(
                        method,
                        url,
                        params,
                        loading,
                        resolve,
                        reject,
                        (this as IAjax).onSessionExpired,
                        options,
                        cancelExecutor
                    );
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                function (e: any) {
                    _opts.reject(e);
                }
            );
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as IAjax).processErrorResponse = <T = any>(
            xhr: XMLHttpRequest,
            _opts: IRequestOptions
        ): void | Promise<void> => {
            const errorResponse = processErrorResponse<T>(xhr, _opts);
            return promisify(errorResponse).then(() => {
                if (xhr.status === 470 && this.onCryptoExpired) {
                    // 加密密钥过期
                    (this as IAjax).onCryptoExpired<T>(
                        {
                            errorCode: xhr.status,
                            errorMsg: xhr.statusText,
                        },
                        _opts
                    );
                    return Promise.reject('status 470: secret key expired');
                }
                return Promise.resolve();
            });
        };
    };
}

export default cryptoExtend;
