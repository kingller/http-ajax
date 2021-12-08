"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
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
            crypto_1.default.AES.setKey(secretKey);
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
            publicKeyPromise = this.get('/encryption/native/public-key');
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
                // 将加密后的秘钥传输给服务器端
                // eslint-disable-next-line no-async-promise-executor
                secretKeyPromise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var key, encryptedSecretKey;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, crypto_1.default.AES.createKey()];
                            case 1:
                                key = _a.sent();
                                return [4 /*yield*/, crypto_1.default.RSA.encrypt(key, publicKeyResponse.publicKey)];
                            case 2:
                                encryptedSecretKey = _a.sent();
                                this
                                    .post('/encryption/native/token', { token: encryptedSecretKey }, {
                                    headers: {
                                        uuid: publicKeyResponse.uuid,
                                    },
                                })
                                    .then(function () {
                                    storage_1.default.setItem(enums_1.STORAGE_KEY.SECRET_KEY, key, 'session');
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
                                return [2 /*return*/];
                        }
                    });
                }); });
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
            return __awaiter(this, void 0, void 0, function () {
                var currentData, index, fieldName, _i, _a, _b, v, i, _c, _d, value, _e, _f, restFieldPaths, _g, _h, d;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            currentData = data;
                            index = 0;
                            _j.label = 1;
                        case 1:
                            if (!(index < fieldPaths.length)) return [3 /*break*/, 16];
                            if (!currentData || typeof currentData !== 'object') {
                                return [3 /*break*/, 16];
                            }
                            fieldName = fieldPaths[index];
                            if (!fieldName) {
                                return [3 /*break*/, 15];
                            }
                            // eslint-disable-next-line no-template-curly-in-string
                            if (fieldName === '${index}') {
                                if (!array_1.isArray(currentData)) {
                                    return [3 /*break*/, 16];
                                }
                            }
                            if (!(index === fieldPaths.length - 1)) return [3 /*break*/, 9];
                            if (!(fieldName === '${index}')) return [3 /*break*/, 6];
                            _i = 0, _a = currentData;
                            _j.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            _b = _a[_i], v = _b[0], i = _b[1];
                            if (!(typeof v !== 'undefined')) return [3 /*break*/, 4];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            // eslint-disable-next-line no-await-in-loop
                            _c = currentData;
                            _d = i;
                            return [4 /*yield*/, encryptOrDecryptFuc(v)];
                        case 3:
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            // eslint-disable-next-line no-await-in-loop
                            _c[_d] = _j.sent();
                            _j.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            value = currentData[fieldName];
                            if (!(typeof value !== 'undefined')) return [3 /*break*/, 8];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            // eslint-disable-next-line no-await-in-loop
                            _e = currentData;
                            _f = fieldName;
                            return [4 /*yield*/, encryptOrDecryptFuc(value)];
                        case 7:
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            // eslint-disable-next-line no-await-in-loop
                            _e[_f] = _j.sent();
                            _j.label = 8;
                        case 8: return [2 /*return*/];
                        case 9:
                            if (!(fieldName === '${index}')) return [3 /*break*/, 14];
                            restFieldPaths = fieldPaths.slice(index + 1);
                            _g = 0, _h = currentData;
                            _j.label = 10;
                        case 10:
                            if (!(_g < _h.length)) return [3 /*break*/, 13];
                            d = _h[_g];
                            // eslint-disable-next-line no-await-in-loop
                            return [4 /*yield*/, encryptOrDecryptDataArrayField(d, restFieldPaths, encryptOrDecryptFuc)];
                        case 11:
                            // eslint-disable-next-line no-await-in-loop
                            _j.sent();
                            _j.label = 12;
                        case 12:
                            _g++;
                            return [3 /*break*/, 10];
                        case 13: return [3 /*break*/, 16];
                        case 14:
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            currentData = currentData[fieldName];
                            _j.label = 15;
                        case 15:
                            index++;
                            return [3 /*break*/, 1];
                        case 16: return [2 /*return*/];
                    }
                });
            });
        }
        function encryptOrDecryptDataField(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data, filed, type) {
            return __awaiter(this, void 0, void 0, function () {
                var encryptOrDecryptFuc, fieldPaths, value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!filed || !data) {
                                return [2 /*return*/];
                            }
                            encryptOrDecryptFuc = type === 'encrypt' ? crypto_1.default.AES.encrypt : crypto_1.default.AES.decrypt;
                            if (!/\$\{index\}(\.|$)/.test(filed)) return [3 /*break*/, 2];
                            fieldPaths = filed.split('.');
                            return [4 /*yield*/, encryptOrDecryptDataArrayField(data, fieldPaths, encryptOrDecryptFuc)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            value = lodash_1.default.get(data, filed);
                            if (!(typeof value !== 'undefined')) return [3 /*break*/, 4];
                            return [4 /*yield*/, encryptOrDecryptFuc(value)];
                        case 3:
                            value = _a.sent();
                            lodash_1.default.set(data, filed, value);
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        /** 字段加密 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function encryptDataField(data, filed) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, encryptOrDecryptDataField(data, filed, 'encrypt')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        /** 字段解密 */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function decryptDataField(data, filed) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, encryptOrDecryptDataField(data, filed, 'decrypt')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function clearCrypto() {
            storage_1.default.removeItem(enums_1.STORAGE_KEY.SECRET_KEY, 'session');
            storage_1.default.removeItem(enums_1.STORAGE_KEY.UUID, 'session');
            crypto_1.default.AES.clearKey();
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
                                native: true,
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
        this.processData = function (params, props) { return __awaiter(_this, void 0, void 0, function () {
            var options, reject, _i, _a, field, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, processData(params, props)];
                    case 1:
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        params = _b.sent();
                        options = props.options, reject = props.reject;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, , 10]);
                        if (!(params && options && options.encrypt)) return [3 /*break*/, 8];
                        params = clone_1.cloneDeep(params);
                        if (!(options.encrypt === 'all')) return [3 /*break*/, 4];
                        return [4 /*yield*/, crypto_1.default.AES.encrypt(params)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        if (!params || typeof params !== 'object') {
                            return [2 /*return*/, params];
                        }
                        if (!Array.isArray(options.encrypt)) return [3 /*break*/, 8];
                        _i = 0, _a = options.encrypt;
                        _b.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        field = _a[_i];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, encryptDataField(params, field)];
                    case 6:
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        // eslint-disable-next-line no-await-in-loop
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_1 = _b.sent();
                        if (reject)
                            reject(e_1);
                        catch_1.catchAjaxError({
                            e: e_1,
                            method: props.method,
                            url: props.url,
                            params: params,
                            callback: this.catchError,
                            type: reject ? 'log' : 'uncaught',
                            options: options,
                        });
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, params];
                }
            });
        }); };
        this.processResponse = function (response, props) { return __awaiter(_this, void 0, void 0, function () {
            var options, decrypt, xhr, encryptResHeader, statusField, data, _i, decrypt_1, field, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, processResponse(response, props)];
                    case 1:
                        response = _a.sent();
                        if (response === null) {
                            return [2 /*return*/, response];
                        }
                        options = props.options;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 11]);
                        decrypt = (options && options.decrypt) || undefined;
                        if (!decrypt) {
                            xhr = props.xhr;
                            encryptResHeader = '';
                            // Fixed `Refused to get unsafe header "encrypt"`
                            if (xhr.getAllResponseHeaders().indexOf('encrypt') >= 0) {
                                encryptResHeader = xhr.getResponseHeader('encrypt');
                            }
                            if (encryptResHeader) {
                                decrypt = JSON.parse(encryptResHeader);
                            }
                        }
                        if (!decrypt) return [3 /*break*/, 9];
                        statusField = this._config.statusField;
                        data = response_data_1.getResponseData({ response: response, statusField: statusField });
                        if (!(decrypt === 'all')) return [3 /*break*/, 4];
                        return [4 /*yield*/, crypto_1.default.AES.decrypt(data)];
                    case 3:
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        data = _a.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        if (!data || typeof data !== 'object') {
                            return [2 /*return*/, response];
                        }
                        if (!Array.isArray(decrypt)) return [3 /*break*/, 8];
                        _i = 0, decrypt_1 = decrypt;
                        _a.label = 5;
                    case 5:
                        if (!(_i < decrypt_1.length)) return [3 /*break*/, 8];
                        field = decrypt_1[_i];
                        // eslint-disable-next-line no-await-in-loop
                        return [4 /*yield*/, decryptDataField(data, field)];
                    case 6:
                        // eslint-disable-next-line no-await-in-loop
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        response = response_data_1.setResponseData({ response: response, data: data, statusField: statusField });
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        e_2 = _a.sent();
                        props.reject(e_2);
                        catch_1.catchAjaxError({
                            e: e_2,
                            method: props.method,
                            url: props.url,
                            params: props.params,
                            callback: this.catchError,
                            type: 'log',
                            options: options,
                            xCorrelationID: props.xCorrelationID,
                            xhr: props.xhr,
                        });
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/, response];
                }
            });
        }); };
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
