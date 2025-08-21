"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var client_crypto_1 = __importDefault(require("client-crypto"));
var storage_1 = __importDefault(require("./utils/storage"));
var enums_1 = require("./utils/enums");
var clone_1 = require("./utils/clone");
var array_1 = require("./utils/array");
var promise_1 = require("./utils/promise");
var catch_1 = require("./utils/catch");
var response_data_1 = require("./utils/response-data");
var url_1 = require("./utils/url");
var publicKeyPromise = null;
var secretKeyPromise = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var waitingPublicKeyPromise = [];
/**
 * 加解密扩展。
 * 加密请求前未获取到密钥或返回 470 状态时，首先发送请求/api/encryption/public-key 获取服务端 RSA 公钥。
 * 客户端生成 AES 密钥，并使用 RSA 加密后发送请求/api/encryption/token 传输给服务端，服务端客户端使用该密钥加解密。
 * 请求头中将会添加字段 uuid，encrypt（uuid:唯一标识码，服务端根据该 uuid 获取密钥；encrypt：加密字段，服务端根据该字段解密）。
 * 解密请求将会在响应头中添加字段 encrypt：加密字段，客户端根据该字段解密。
 */
function cryptoExtend() {
    (function () {
        var secretKey = storage_1.default.getItem(enums_1.STORAGE_KEY.SECRET_KEY, 'session');
        if (secretKey) {
            client_crypto_1.default.AES.setKey(atob(secretKey));
        }
    })();
    return function cryptoFunc() {
        var _this = this;
        var _a = this, beforeSend = _a.beforeSend, processParams = _a.processParams, processResponse = _a.processResponse, processErrorResponse = _a.processErrorResponse, clear = _a.clear;
        // 校验该扩展是否已添加过
        if (this._cryptoExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `cryptoExtend` can only be added to ajax once!');
        }
        else {
            // 校验加密扩展必须在签名扩展前添加
            if (this._snExtendAdded) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                console && console.warn('Warning: `cryptoExtend` should be added to ajax before `signatureExtend`!');
            }
        }
        // 添加标志符用来校验该扩展是否已添加
        this._cryptoExtendAdded = true;
        function hasSecretKey() {
            return !!storage_1.default.getItem(enums_1.STORAGE_KEY.SECRET_KEY, 'session');
        }
        function getUuid() {
            return storage_1.default.getItem(enums_1.STORAGE_KEY.UUID, 'session');
        }
        function getPublicKey() {
            // 从服务端获取公钥
            publicKeyPromise = this.get('/encryption/public-key');
            return new Promise(function (resolve, reject) {
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
        function sendSecretKeyRequest() {
            var _this = this;
            return getPublicKey.apply(this).then(function (publicKeyResponse) {
                // 生成 AES 秘钥
                var newSecretKey = client_crypto_1.default.AES.createKey();
                // 使用 RSA 公钥加密秘钥
                var encryptedSecretKey = client_crypto_1.default.RSA.encryptOAEP(newSecretKey, publicKeyResponse.publicKey);
                // 将加密后的秘钥传输给服务器端
                secretKeyPromise = new Promise(function (resolve, reject) {
                    _this
                        .post('/encryption/token', { token: encryptedSecretKey }, {
                        headers: {
                            uuid: publicKeyResponse.uuid,
                        },
                    })
                        .then(function () {
                        if (!btoa) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            console && console.error('`window.btoa` is undefined');
                        }
                        storage_1.default.setItem(enums_1.STORAGE_KEY.SECRET_KEY, btoa(newSecretKey), 'session');
                        storage_1.default.setItem(enums_1.STORAGE_KEY.UUID, publicKeyResponse.uuid, 'session');
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
        function createSecretKey() {
            var _this = this;
            if (!hasSecretKey()) {
                if (secretKeyPromise) {
                    return secretKeyPromise;
                }
                if (publicKeyPromise) {
                    return new Promise(function (resolve, reject) {
                        waitingPublicKeyPromise.push({ resolve: resolve, reject: reject });
                    });
                }
                return new Promise(function (resolve, reject) {
                    sendSecretKeyRequest.apply(_this)
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
        data, fieldPaths, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        encryptOrDecryptFuc) {
            var currentData = data;
            var _loop_1 = function (index) {
                if (!currentData || typeof currentData !== 'object') {
                    return "break";
                }
                var fieldName = fieldPaths[index];
                if (!fieldName) {
                    return "continue";
                }
                // eslint-disable-next-line no-template-curly-in-string
                if (fieldName === '${index}') {
                    if (!(0, array_1.isArray)(currentData)) {
                        return "break";
                    }
                }
                if (index === fieldPaths.length - 1) {
                    // eslint-disable-next-line no-template-curly-in-string
                    if (fieldName === '${index}') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-loop-func
                        currentData.forEach(function (v, i) {
                            if (typeof v !== 'undefined') {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                currentData[i] = encryptOrDecryptFuc(v);
                            }
                        });
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        var value = currentData[fieldName];
                        if (typeof value !== 'undefined') {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            currentData[fieldName] = encryptOrDecryptFuc(value);
                        }
                    }
                    return { value: void 0 };
                }
                // eslint-disable-next-line no-template-curly-in-string
                if (fieldName === '${index}') {
                    var restFieldPaths_1 = fieldPaths.slice(index + 1);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    currentData.forEach(function (d) {
                        encryptOrDecryptDataArrayField(d, restFieldPaths_1, encryptOrDecryptFuc);
                    });
                    return "break";
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    currentData = currentData[fieldName];
                }
            };
            for (var index = 0; index < fieldPaths.length; index++) {
                var state_1 = _loop_1(index);
                if (typeof state_1 === "object")
                    return state_1.value;
                if (state_1 === "break")
                    break;
            }
        }
        function encryptOrDecryptDataField(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data, filed, type) {
            if (!filed || !data) {
                return;
            }
            var encryptOrDecryptFuc = type === 'encrypt' ? client_crypto_1.default.AES.encrypt : client_crypto_1.default.AES.decrypt;
            if (/\$\{index\}(\.|$)/.test(filed)) {
                // 需要遍历数组加密
                var fieldPaths = filed.split('.');
                encryptOrDecryptDataArrayField(data, fieldPaths, encryptOrDecryptFuc);
            }
            else {
                var value = lodash_1.default.get(data, filed);
                if (typeof value !== 'undefined') {
                    value = encryptOrDecryptFuc(value);
                    lodash_1.default.set(data, filed, value);
                }
            }
        }
        /** 字段加密 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function encryptDataField(data, filed) {
            encryptOrDecryptDataField(data, filed, 'encrypt');
        }
        /** 字段解密 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function decryptDataField(data, filed) {
            encryptOrDecryptDataField(data, filed, 'decrypt');
        }
        function clearCrypto() {
            storage_1.default.removeItem(enums_1.STORAGE_KEY.SECRET_KEY, 'session');
            storage_1.default.removeItem(enums_1.STORAGE_KEY.UUID, 'session');
            client_crypto_1.default.AES.clearKey();
            publicKeyPromise = null;
            secretKeyPromise = null;
            waitingPublicKeyPromise = [];
        }
        this.beforeSend = function (props) {
            var promise;
            if (beforeSend) {
                promise = beforeSend(props);
            }
            promise = (0, promise_1.promisify)(promise);
            var options = props.options;
            var uuid = getUuid();
            // 由于解密需要服务端返回响应头才知道，故统一添加唯一标志符 uuid，服务端将根据 uuid 取得 AES 密钥
            if (uuid) {
                lodash_1.default.merge(options, {
                    headers: {
                        uuid: uuid,
                    },
                });
            }
            // 解密的不会传 options.decrypt，这里只是提供了手动指定 decrypt 功能
            // 解密需去响应头获取 encrypt 字段，响应头返回前不知道该请求是需解密请求，所以解密请求需在 470 之后生成 AES 密钥并传输给服务端
            // 加密请求则根据 options.encrypt，如果没有 AES 密钥，则生成并传输给服务端
            if (options && (options.encrypt || options.decrypt)) {
                return promise.then(function () {
                    return createSecretKey.apply(_this).then(function () {
                        lodash_1.default.merge(options, {
                            headers: {
                                uuid: getUuid(),
                            },
                        });
                        if (options.encrypt) {
                            lodash_1.default.merge(options, {
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
        function encryptParams(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params, encrypt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) {
            if (encrypt === 'all') {
                return client_crypto_1.default.AES.encrypt(params);
            }
            if (!params || typeof params !== 'object') {
                return params;
            }
            if (Array.isArray(encrypt)) {
                params = (0, clone_1.cloneDeep)(params);
                encrypt.forEach(function (field) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    encryptDataField(params, field);
                });
            }
            return params;
        }
        this.processParams = function (props) {
            var _a = processParams(props), urlParams = _a.urlParams, params = _a.params, paramsInOptions = _a.paramsInOptions;
            var options = props.options, reject = props.reject, processData = props.processData;
            try {
                if (options && options.encrypt) {
                    var encrypt = options.encrypt;
                    if (urlParams) {
                        if (options.encrypt === 'all') {
                            urlParams = (0, clone_1.cloneDeep)(urlParams);
                            Object.keys(urlParams).forEach(function (field) {
                                encryptDataField(urlParams, field);
                            });
                        }
                        else {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            urlParams = encryptParams(urlParams, encrypt);
                        }
                    }
                    if (params) {
                        if ((0, url_1.needFormatData)({ params: params, processData: processData })) {
                            params = encryptParams(params, encrypt);
                        }
                    }
                    if (paramsInOptions) {
                        paramsInOptions = encryptParams(paramsInOptions, encrypt);
                    }
                }
            }
            catch (e) {
                if (reject)
                    reject(e);
                (0, catch_1.catchAjaxError)({
                    e: e,
                    method: props.method,
                    url: props.url,
                    params: params,
                    callback: _this.catchError,
                    type: reject ? 'log' : 'uncaught',
                    options: options,
                });
            }
            return { urlParams: urlParams, params: params, paramsInOptions: paramsInOptions };
        };
        this.processResponse = function (response, props) {
            response = processResponse(response, props);
            if (response === null) {
                return response;
            }
            var options = props.options;
            try {
                var decrypt = (options && options.decrypt) || undefined;
                if (!decrypt) {
                    var xhr = props.xhr;
                    var encryptResHeader = '';
                    // Fixed `Refused to get unsafe header "encrypt"`
                    if (xhr.getAllResponseHeaders().indexOf('encrypt') >= 0) {
                        encryptResHeader = xhr.getResponseHeader('encrypt');
                    }
                    if (encryptResHeader) {
                        decrypt = JSON.parse(encryptResHeader);
                    }
                }
                if (decrypt) {
                    var statusField = _this._config.statusField;
                    var data_1 = (0, response_data_1.getResponseData)({ response: response, statusField: statusField });
                    if (decrypt === 'all') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        data_1 = client_crypto_1.default.AES.decrypt(data_1);
                    }
                    else {
                        if (!data_1 || typeof data_1 !== 'object') {
                            return response;
                        }
                        if (Array.isArray(decrypt)) {
                            decrypt.forEach(function (field) {
                                decryptDataField(data_1, field);
                            });
                        }
                    }
                    response = (0, response_data_1.setResponseData)({ response: response, data: data_1, statusField: statusField });
                }
            }
            catch (e) {
                props.reject(e);
                (0, catch_1.catchAjaxError)({
                    e: e,
                    method: props.method,
                    url: props.url,
                    params: props.params,
                    callback: _this.catchError,
                    type: 'log',
                    options: options,
                    xCorrelationID: props.xCorrelationID,
                    xhr: props.xhr,
                });
            }
            return response;
        };
        this.clear = function () {
            clear();
            clearCrypto();
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.onCryptoExpired = function (error, _opts) {
            if (!publicKeyPromise && !secretKeyPromise) {
                clearCrypto();
            }
            // 解密需去响应头获取 encrypt 字段，响应头返回前不知道该请求是需解密请求，所以解密请求需在 470 之后生成 AES 密钥并传输给服务端
            createSecretKey.apply(_this).then(function () {
                var method = _opts.method, url = _opts.url, params = _opts.params, loading = _opts.loading, resolve = _opts.resolve, reject = _opts.reject, options = _opts.options, cancelExecutor = _opts.cancelExecutor;
                // prettier-ignore
                _this.sendRequest(method, url, params, loading, resolve, reject, _this.onSessionExpired, options, cancelExecutor);
            }, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function (e) {
                _opts.reject(e);
            });
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.processErrorResponse = function (xhr, _opts) {
            var errorResponse = processErrorResponse(xhr, _opts);
            return (0, promise_1.promisify)(errorResponse).then(function () {
                if (xhr.status === 470 && _this.onCryptoExpired) {
                    // 加密密钥过期
                    _this.onCryptoExpired({
                        errorCode: xhr.status,
                        errorMsg: xhr.statusText,
                    }, _opts);
                    return Promise.reject('status 470: secret key expired');
                }
                return Promise.resolve();
            });
        };
    };
}
exports.default = cryptoExtend;
