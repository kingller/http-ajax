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
var client_crypto_1 = __importDefault(require("client-crypto"));
var str2ab = function (str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};
var ab2str = function (buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};
var RSA = /** @class */ (function () {
    function RSA() {
        var _this = this;
        this.encrypt = function (secretKeyStr, pem) { return __awaiter(_this, void 0, void 0, function () {
            var crypto, secretKey, pemHeader, pemFooter, pemContents, binaryDerString, binaryDer, publicKey, encryptedKey, strEncryptedKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crypto = window.crypto ||
                            window.webkitCrypto ||
                            window.mozCrypto ||
                            window.oCrypto ||
                            window.msCrypto;
                        if (!crypto) {
                            return [2 /*return*/, client_crypto_1.default.RSA.encrypt(secretKeyStr, pem)];
                        }
                        secretKey = str2ab(secretKeyStr);
                        pemHeader = '-----BEGIN PUBLIC KEY-----';
                        pemFooter = '-----END PUBLIC KEY-----';
                        pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length - 1);
                        if (!window.atob) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            console && console.error('`window.atob` is undefined');
                        }
                        binaryDerString = window.atob(pemContents);
                        binaryDer = str2ab(binaryDerString);
                        return [4 /*yield*/, window.crypto.subtle.importKey('spki', binaryDer, {
                                name: 'RSA-OAEP',
                                hash: 'SHA-256',
                            }, true, ['encrypt'])];
                    case 1:
                        publicKey = _a.sent();
                        return [4 /*yield*/, window.crypto.subtle.encrypt({
                                name: 'RSA-OAEP',
                            }, publicKey, secretKey)];
                    case 2:
                        encryptedKey = _a.sent();
                        strEncryptedKey = window.btoa(ab2str(encryptedKey));
                        return [2 /*return*/, strEncryptedKey];
                }
            });
        }); };
    }
    return RSA;
}());
var AES = /** @class */ (function () {
    function AES() {
        var _this = this;
        this.createKey = function () { return __awaiter(_this, void 0, void 0, function () {
            var crypto, key, arrBufferSecretKey, secretKeyStr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crypto = window.crypto ||
                            window.webkitCrypto ||
                            window.mozCrypto ||
                            window.oCrypto ||
                            window.msCrypto;
                        if (!crypto) {
                            return [2 /*return*/, window.btoa(client_crypto_1.default.AES.createKey(16))];
                        }
                        return [4 /*yield*/, window.crypto.subtle.generateKey({
                                name: 'AES-GCM',
                                length: 128,
                            }, true, ['encrypt', 'decrypt'])];
                    case 1:
                        key = _a.sent();
                        return [4 /*yield*/, this.exportCryptoKey(key)];
                    case 2:
                        arrBufferSecretKey = _a.sent();
                        secretKeyStr = window.btoa(ab2str(arrBufferSecretKey));
                        this._key = secretKeyStr;
                        return [2 /*return*/, secretKeyStr];
                }
            });
        }); };
        /** 设置秘钥 */
        this.setKey = function (secretKey) {
            var crypto = window.crypto ||
                window.webkitCrypto ||
                window.mozCrypto ||
                window.oCrypto ||
                window.msCrypto;
            if (!crypto) {
                client_crypto_1.default.AES.setKey(window.atob(secretKey));
            }
            _this._key = secretKey;
        };
        this.clearKey = function () {
            var crypto = window.crypto ||
                window.webkitCrypto ||
                window.mozCrypto ||
                window.oCrypto ||
                window.msCrypto;
            if (!crypto) {
                client_crypto_1.default.AES.clearKey();
            }
            _this._key = undefined;
        };
        this.encrypt = function (data, rawKey) { return __awaiter(_this, void 0, void 0, function () {
            var crypto, iv, arrBufferKey, secretKey, enc, newData, ciphertext, strIv, strCiphertext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!rawKey) {
                            rawKey = this._key;
                        }
                        crypto = window.crypto ||
                            window.webkitCrypto ||
                            window.mozCrypto ||
                            window.oCrypto ||
                            window.msCrypto;
                        if (!crypto) {
                            return [2 /*return*/, client_crypto_1.default.AES.encrypt(data)];
                        }
                        iv = window.crypto.getRandomValues(new Uint8Array(12));
                        arrBufferKey = str2ab(window.atob(rawKey));
                        return [4 /*yield*/, window.crypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
                                'encrypt',
                                'decrypt',
                            ])];
                    case 1:
                        secretKey = _a.sent();
                        enc = new TextEncoder();
                        newData = enc.encode(JSON.stringify(data));
                        return [4 /*yield*/, window.crypto.subtle.encrypt({
                                name: 'AES-GCM',
                                iv: iv,
                                tagLength: 128,
                            }, secretKey, newData)];
                    case 2:
                        ciphertext = _a.sent();
                        strIv = ab2str(iv);
                        strCiphertext = ab2str(ciphertext);
                        return [2 /*return*/, window.btoa("" + strIv + strCiphertext)];
                }
            });
        }); };
        this.decrypt = function (ciphertext, rawKey) { return __awaiter(_this, void 0, void 0, function () {
            var crypto, strIv, strCiphertext, iv, newCiphertext, arrBufferKey, secretKey, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!rawKey) {
                            rawKey = this._key;
                        }
                        crypto = window.crypto ||
                            window.webkitCrypto ||
                            window.mozCrypto ||
                            window.oCrypto ||
                            window.msCrypto;
                        if (!crypto) {
                            return [2 /*return*/, client_crypto_1.default.AES.decrypt(ciphertext)];
                        }
                        ciphertext = window.atob(ciphertext);
                        strIv = ciphertext.slice(0, 12);
                        strCiphertext = ciphertext.slice(12);
                        iv = str2ab(strIv);
                        newCiphertext = str2ab(strCiphertext);
                        arrBufferKey = str2ab(window.atob(rawKey));
                        return [4 /*yield*/, window.crypto.subtle.importKey('raw', arrBufferKey, 'AES-GCM', true, [
                                'encrypt',
                                'decrypt',
                            ])];
                    case 1:
                        secretKey = _a.sent();
                        return [4 /*yield*/, window.crypto.subtle.decrypt({
                                name: 'AES-GCM',
                                iv: iv,
                            }, secretKey, newCiphertext)];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, JSON.parse(new TextDecoder().decode(data))];
                }
            });
        }); };
        this.exportCryptoKey = function (key) { return __awaiter(_this, void 0, void 0, function () {
            var exported;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, window.crypto.subtle.exportKey('raw', key)];
                    case 1:
                        exported = _a.sent();
                        return [2 /*return*/, exported];
                }
            });
        }); };
    }
    return AES;
}());
var webCrypto = {
    RSA: new RSA(),
    AES: new AES(),
};
exports.default = webCrypto;