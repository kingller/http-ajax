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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var sign_file_1 = __importDefault(require("./utils/sign-file"));
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
            return atob(keyStr);
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
        var signData = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var toSnStr, fileSum, _c, requestBody, queryParams, formData, formDataEntries_2, isSignFileField, _d, formDataEntries_1, formDataEntries_1_1, key, value, fileHash, e_1_1, timestamp, appNonce, headers;
            var _e;
            var _this = this;
            var _f, e_1, _g, _h;
            var params = _b.params, paramsInOptions = _b.paramsInOptions, method = _b.method, options = _b.options, processData = _b.processData;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        toSnStr = '';
                        fileSum = '';
                        _c = this.stringifyParams({
                            params: params,
                            paramsInOptions: paramsInOptions,
                            method: method,
                            cache: true,
                            encodeValue: false,
                            processData: processData,
                        }), requestBody = _c.requestBody, queryParams = _c.queryParams;
                        if (!(method === interface_1.METHODS.get)) return [3 /*break*/, 1];
                        if (queryParams) {
                            toSnStr = queryParams;
                        }
                        return [3 /*break*/, 18];
                    case 1:
                        if (!(requestBody && typeof requestBody === 'string')) return [3 /*break*/, 2];
                        toSnStr = requestBody;
                        return [3 /*break*/, 18];
                    case 2:
                        formData = [];
                        if (!(0, form_1.isFormData)(requestBody)) return [3 /*break*/, 18];
                        formDataEntries_2 = [];
                        requestBody.forEach(function (value, key) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                formDataEntries_2.push([key, value]);
                                return [2 /*return*/];
                            });
                        }); });
                        isSignFileField = getKey(['aXNT', 'aWdu', 'Rm', 'ls', 'ZQ', '=', '=']);
                        _j.label = 3;
                    case 3:
                        _j.trys.push([3, 11, 12, 17]);
                        _d = true, formDataEntries_1 = __asyncValues(formDataEntries_2);
                        _j.label = 4;
                    case 4: return [4 /*yield*/, formDataEntries_1.next()];
                    case 5:
                        if (!(formDataEntries_1_1 = _j.sent(), _f = formDataEntries_1_1.done, !_f)) return [3 /*break*/, 10];
                        _h = formDataEntries_1_1.value;
                        _d = false;
                        key = _h[0], value = _h[1];
                        if (!(value instanceof File)) return [3 /*break*/, 8];
                        if (!(!options[isSignFileField] || options[isSignFileField](value))) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, sign_file_1.default)(value)];
                    case 6:
                        fileHash = _j.sent();
                        formData.push("".concat(key, "=").concat(fileHash, ",").concat(value.size));
                        _j.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        formData.push("".concat(key, "=").concat(value));
                        _j.label = 9;
                    case 9:
                        _d = true;
                        return [3 /*break*/, 4];
                    case 10: return [3 /*break*/, 17];
                    case 11:
                        e_1_1 = _j.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 17];
                    case 12:
                        _j.trys.push([12, , 15, 16]);
                        if (!(!_d && !_f && (_g = formDataEntries_1.return))) return [3 /*break*/, 14];
                        return [4 /*yield*/, _g.call(formDataEntries_1)];
                    case 13:
                        _j.sent();
                        _j.label = 14;
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 16: return [7 /*endfinally*/];
                    case 17:
                        formData.sort();
                        toSnStr = formData.join('&');
                        fileSum = (0, sha256_1.default)(toSnStr);
                        toSnStr = fileSum;
                        _j.label = 18;
                    case 18:
                        timestamp = new Date().getTime();
                        appNonce = (0, uuid_1.v4)();
                        headers = (_e = {},
                            _e[signField] = (0, sha256_1.default)("".concat(toSnStr).concat(timestamp).concat((0, nonce_1.default)(appNonce))),
                            _e[timestampField] = timestamp,
                            _e[appNonceField] = appNonce,
                            _e);
                        if (fileSum) {
                            headers[fileSumField] = fileSum;
                        }
                        lodash_1.default.merge(options, {
                            headers: headers,
                        });
                        return [2 /*return*/];
                }
            });
        }); };
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
