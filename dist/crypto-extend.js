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
var crypto_1 = __importDefault(require("./utils/crypto"));
var publicKeyPromise = null;
var secretKeyPromise = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var waitingPublicKeyPromise = [];
/**
 * 加解密扩展。
 * 加密请求前未获取到密钥或返回470状态时，首先发送请求/api/encryption/public-key获取服务端RSA公钥。
 * 客户端生成AES密钥，并使用RSA加密后发送请求/api/encryption/token传输给服务端，服务端客户端使用该密钥加解密。
 * 请求头中将会添加字段uuid，encrypt（uuid:唯一标识码，服务端根据该uuid获取密钥；encrypt：加密字段，服务端根据该字段解密）。
 * 解密请求将会在响应头中添加字段encrypt：加密字段，客户端根据该字段解密。
 */
function cryptoExtend() {
    (function () {
        var secretKey = storage_1.default.getItem(enums_1.STORAGE_KEY.SECRET_KEY, 'session');
        if (secretKey) {
            client_crypto_1.default.AES.setKey(window.atob(secretKey));
        }
    })();
    return function crypto() {
        var _this = this;
        var _a = this, beforeSend = _a.beforeSend, processData = _a.processData, processResponse = _a.processResponse, processErrorResponse = _a.processErrorResponse, clear = _a.clear;
        // 校验该扩展是否已添加过
        if (this._cryptoExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `cryptoExtend` can only be added to ajax once!');
        }
        else {
            // 校验加密扩展必须在签名扩展前添加
            if (this._signatureExtendAdded) {
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
                // 生成AES秘钥
                var newSecretKey = client_crypto_1.default.AES.createKey();
                var key = crypto_1.default.AES.createKey();
                console.log('🚀 ~ file: crypto-extend.ts ~ line 100 ~ returngetPublicKey.apply ~ key', key);
                // 使用RSA公钥加密秘钥
                var encryptedSecretKey = client_crypto_1.default.RSA.encrypt(newSecretKey, publicKeyResponse.publicKey);
                var newEncryptedSecretKey = crypto_1.default.RSA.encrypt(key, publicKeyResponse.publicKey);
                console.log('🚀 ~ file: crypto-extend.ts ~ line 104 ~ returngetPublicKey.apply ~ newEncryptedSecretKey', newEncryptedSecretKey);
                // 将加密后的秘钥传输给服务器端
                secretKeyPromise = new Promise(function (resolve, reject) {
                    _this
                        .post('/encryption/token', { token: encryptedSecretKey }, {
                        headers: {
                            uuid: publicKeyResponse.uuid,
                        },
                    })
                        .then(function () {
                        if (!window.btoa) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            console && console.error('`window.btoa` is undefined');
                        }
                        storage_1.default.setItem(enums_1.STORAGE_KEY.SECRET_KEY, window.btoa(newSecretKey), 'session');
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
                    if (!array_1.isArray(currentData)) {
                        return "break";
                    }
                }
                if (index === fieldPaths.length - 1) {
                    // eslint-disable-next-line no-template-curly-in-string
                    if (fieldName === '${index}') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            promise = promise_1.promisify(promise);
            var options = props.options;
            var uuid = getUuid();
            // 由于解密需要服务端返回响应头才知道，故统一添加唯一标志符uuid，服务端将根据uuid取得AES密钥
            if (uuid) {
                lodash_1.default.merge(options, {
                    headers: {
                        uuid: uuid,
                    },
                });
            }
            // 解密的不会传options.decrypt，这里只是提供了手动指定decrypt功能
            // 解密需去响应头获取encrypt字段，响应头返回前不知道该请求是需解密请求，所以解密请求需在 470 之后生成AES密钥并传输给服务端
            // 加密请求则根据options.encrypt，如果没有AES密钥，则生成并传输给服务端
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
        this.processData = function (params, props) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params = processData(params, props);
            var options = props.options, reject = props.reject;
            try {
                if (params && options && options.encrypt) {
                    params = clone_1.cloneDeep(params);
                    if (options.encrypt === 'all') {
                        return client_crypto_1.default.AES.encrypt(params);
                    }
                    if (!params || typeof params !== 'object') {
                        return params;
                    }
                    if (Array.isArray(options.encrypt)) {
                        options.encrypt.forEach(function (field) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            encryptDataField(params, field);
                        });
                    }
                }
            }
            catch (e) {
                if (reject)
                    reject(e);
                catch_1.catchAjaxError({
                    e: e,
                    method: props.method,
                    url: props.url,
                    params: params,
                    callback: _this.catchError,
                    type: reject ? 'log' : 'uncaught',
                    options: options,
                });
            }
            return params;
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
                    var data_1 = response_data_1.getResponseData({ response: response, statusField: statusField });
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
                    response = response_data_1.setResponseData({ response: response, data: data_1, statusField: statusField });
                }
            }
            catch (e) {
                props.reject(e);
                catch_1.catchAjaxError({
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
            // 解密需去响应头获取encrypt字段，响应头返回前不知道该请求是需解密请求，所以解密请求需在 470 之后生成AES密钥并传输给服务端
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
            return promise_1.promisify(errorResponse).then(function () {
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
