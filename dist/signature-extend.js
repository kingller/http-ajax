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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var uuid_1 = require("uuid");
var interface_1 = require("./interface");
var form_1 = require("./utils/form");
var sha256_1 = __importDefault(require("./utils/sha256"));
var nonce_1 = __importDefault(require("./utils/nonce"));
require("./polyfill/form-data");
/**
 * 签名扩展。
 * 将会在请求头中添加字段 sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC 时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入 redis 几分钟后过期）。
 */
function snExtend() {
    return function sn() {
        var _this = this;
        var processParamsAfter = this.processParamsAfter;
        var getKey = function (splits) {
            var keyStr = splits.join('');
            return window.atob(keyStr);
        };
        // 参数混淆，增加签名方式代码被分析出难度
        // app-nonce 只使用一次标识码
        var appNonceField = getKey(['YX', 'Bw', 'LW', '5v', 'bm', 'Nl']);
        // timestamp 时间
        var timestampField = getKey(['dGl', 'tZX', 'N0Y', 'W1w']);
        // sign 签名
        var signField = getKey(['c2l', 'nbg', '=', '=']);
        // file-sum 文件签名
        var fileSumField = getKey(['Zml', 'sZS', '1zd', 'W0', '=']);
        // 校验该扩展是否已添加过
        if (this._snExtendAdded) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error('Error: `snExtend` can only be added to ajax once!');
        }
        // 添加标志符用来校验该扩展是否已添加
        this._snExtendAdded = true;
        var readFile = function (file) {
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();
                reader.onload = function () {
                    resolve(reader.result); // This is the file content as a data URL
                };
                reader.onerror = function (ev) {
                    reject(ev);
                    return null;
                };
                reader.readAsDataURL(file); // Read file as data URL (string)
            });
        };
        var signData = function (_a) {
            var params = _a.params, paramsInOptions = _a.paramsInOptions, method = _a.method, options = _a.options, processData = _a.processData;
            return __awaiter(_this, void 0, void 0, function () {
                var toSnStr, fileSum, _b, requestBody, queryParams, formData, formDataEntries_2, isSignFileField, _c, formDataEntries_1, formDataEntries_1_1, key, value, fileDataURL, e_1_1, timestamp, appNonce, headers;
                var _d;
                var _this = this;
                var _e, e_1, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            toSnStr = '';
                            fileSum = '';
                            _b = this.stringifyParams({
                                params: params,
                                paramsInOptions: paramsInOptions,
                                method: method,
                                cache: true,
                                encodeValue: false,
                                processData: processData,
                            }), requestBody = _b.requestBody, queryParams = _b.queryParams;
                            if (!(method === interface_1.METHODS.get)) return [3 /*break*/, 1];
                            if (queryParams) {
                                toSnStr = queryParams;
                            }
                            return [3 /*break*/, 21];
                        case 1:
                            if (!(requestBody && typeof requestBody === 'string')) return [3 /*break*/, 2];
                            toSnStr = requestBody;
                            return [3 /*break*/, 21];
                        case 2:
                            formData = [];
                            if (!(0, form_1.isFormData)(requestBody)) return [3 /*break*/, 21];
                            formDataEntries_2 = [];
                            requestBody.forEach(function (value, key) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    formDataEntries_2.push([key, value]);
                                    return [2 /*return*/];
                                });
                            }); });
                            isSignFileField = getKey(['aXNT', 'aWdu', 'Rm', 'ls', 'ZQ', '=', '=']);
                            _h.label = 3;
                        case 3:
                            _h.trys.push([3, 14, 15, 20]);
                            _c = true, formDataEntries_1 = __asyncValues(formDataEntries_2);
                            _h.label = 4;
                        case 4: return [4 /*yield*/, formDataEntries_1.next()];
                        case 5:
                            if (!(formDataEntries_1_1 = _h.sent(), _e = formDataEntries_1_1.done, !_e)) return [3 /*break*/, 13];
                            _g = formDataEntries_1_1.value;
                            _c = false;
                            _h.label = 6;
                        case 6:
                            _h.trys.push([6, , 11, 12]);
                            key = _g[0], value = _g[1];
                            if (!(value instanceof File)) return [3 /*break*/, 9];
                            if (!(!options[isSignFileField] || options[isSignFileField](value))) return [3 /*break*/, 8];
                            return [4 /*yield*/, readFile(value)];
                        case 7:
                            fileDataURL = _h.sent();
                            formData.push("".concat(key, "=").concat(fileDataURL));
                            _h.label = 8;
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            formData.push("".concat(key, "=").concat(value));
                            _h.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            _c = true;
                            return [7 /*endfinally*/];
                        case 12: return [3 /*break*/, 4];
                        case 13: return [3 /*break*/, 20];
                        case 14:
                            e_1_1 = _h.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 20];
                        case 15:
                            _h.trys.push([15, , 18, 19]);
                            if (!(!_c && !_e && (_f = formDataEntries_1.return))) return [3 /*break*/, 17];
                            return [4 /*yield*/, _f.call(formDataEntries_1)];
                        case 16:
                            _h.sent();
                            _h.label = 17;
                        case 17: return [3 /*break*/, 19];
                        case 18:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 19: return [7 /*endfinally*/];
                        case 20:
                            formData.sort();
                            toSnStr = formData.join('&');
                            fileSum = (0, sha256_1.default)(toSnStr);
                            toSnStr = fileSum;
                            _h.label = 21;
                        case 21:
                            timestamp = new Date().getTime();
                            appNonce = (0, uuid_1.v4)();
                            headers = (_d = {},
                                _d[signField] = (0, sha256_1.default)("".concat(toSnStr).concat(timestamp).concat((0, nonce_1.default)(appNonce))),
                                _d[timestampField] = timestamp,
                                _d[appNonceField] = appNonce,
                                _d);
                            if (fileSum) {
                                headers[fileSumField] = fileSum;
                            }
                            lodash_1.default.merge(options, {
                                headers: headers,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.processParamsAfter = function (props) { return __awaiter(_this, void 0, void 0, function () {
            var params, paramsInOptions, method, options, processData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, processParamsAfter(props)];
                    case 1:
                        _a.sent();
                        params = props.params, paramsInOptions = props.paramsInOptions, method = props.method, options = props.options, processData = props.processData;
                        return [4 /*yield*/, signData({ params: params, paramsInOptions: paramsInOptions, method: method, options: options, processData: processData })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
    };
}
exports.default = snExtend;
