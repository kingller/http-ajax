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
var v4_1 = __importDefault(require("uuid/v4"));
var form_1 = require("./utils/form");
var load_script_1 = require("./utils/load-script");
/**
 * 签名扩展。
 * 将会在请求头中添加字段sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入redis几分钟后过期）。
 */
function signatureExtend() {
    return function signature() {
        var _this = this;
        var processDataAfter = this.processDataAfter;
        // 参数混淆，增加签名方式代码被分析出难度
        // app-nonce 只使用一次标识码
        var appNonceField = ['app', ['non', 'ce'].join('')].join('-');
        // timestamp 时间
        var timestampField = ['time', 'sta', 'mp'].join('');
        // sign 签名
        var signField = ['si', 'gn'].join('');
        // 校验该扩展是否已添加过
        if (this._signatureExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `signatureExtend` can only be added to ajax once!');
        }
        // 添加标志符用来校验该扩展是否已添加
        this._signatureExtendAdded = true;
        var signData = function (_a) {
            var params = _a.params, method = _a.method, options = _a.options, processData = _a.processData;
            return __awaiter(_this, void 0, void 0, function () {
                var signatureStr, timestamp, appNonce, webCrypto, str, msgUint8, hashBuffer, hashArray, hashHex;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            signatureStr = form_1.isFormData(params) || processData === false
                                ? ''
                                : this.stringifyParams(params, method, { cache: true, encodeValue: false });
                            timestamp = new Date().getTime();
                            appNonce = v4_1.default();
                            webCrypto = window.crypto ||
                                window.webkitCrypto ||
                                window.mozCrypto ||
                                window.oCrypto ||
                                window.msCrypto;
                            if (!webCrypto) {
                                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                                console && console.error('`window.crypto` is undefined');
                            }
                            str = "" + signatureStr + timestamp + appNonce.substring(2, appNonce.length - 1);
                            if (!!window.TextEncoder) return [3 /*break*/, 2];
                            return [4 /*yield*/, load_script_1.loadScript('https://assets.gaiaworkforce.com/libs/text-encoding/0.7.0/encoding.js')];
                        case 1:
                            _c.sent();
                            _c.label = 2;
                        case 2:
                            msgUint8 = new TextEncoder().encode(str);
                            return [4 /*yield*/, webCrypto.subtle.digest('SHA-256', msgUint8)];
                        case 3:
                            hashBuffer = _c.sent();
                            hashArray = Array.from(new Uint8Array(hashBuffer));
                            hashHex = hashArray.map(function (b) { return lodash_1.default.padStart(b.toString(16), 2, '0'); }).join('');
                            lodash_1.default.merge(options, {
                                headers: (_b = {},
                                    _b[signField] = hashHex,
                                    _b[timestampField] = timestamp,
                                    _b[appNonceField] = appNonce,
                                    _b),
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.processDataAfter = function (params, props) { return __awaiter(_this, void 0, void 0, function () {
            var method, options, processData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, processDataAfter(params, props)];
                    case 1:
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        params = (_a.sent());
                        method = props.method, options = props.options, processData = props.processData;
                        return [4 /*yield*/, signData({ params: params, method: method, options: options, processData: processData })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, params];
                }
            });
        }); };
    };
}
exports.default = signatureExtend;
