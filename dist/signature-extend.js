"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var client_crypto_1 = __importDefault(require("client-crypto"));
var uuid_1 = require("uuid");
var interface_1 = require("./interface");
/**
 * 签名扩展。
 * 将会在请求头中添加字段 sign，timestamp，app-nonce。
 * sign：签名文本；
 * timestamp（签名参数）：UTC 时间（用于校验是否已过期）；
 * app-nonce（签名参数）：只使用一次标识码（用于校验是否已发送过，存入 redis 几分钟后过期）。
 */
function signatureExtend() {
    return function signature() {
        var _this = this;
        var processParamsAfter = this.processParamsAfter;
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
            var _b;
            var params = _a.params, paramsInOptions = _a.paramsInOptions, method = _a.method, options = _a.options, processData = _a.processData;
            var signatureStr = '';
            var _c = _this.stringifyParams({
                params: params,
                paramsInOptions: paramsInOptions,
                method: method,
                cache: true,
                encodeValue: false,
                processData: processData,
            }), requestBody = _c.requestBody, queryParams = _c.queryParams;
            if (method === interface_1.METHODS.get) {
                if (queryParams) {
                    signatureStr = queryParams;
                }
            }
            else {
                if (requestBody && typeof requestBody === 'string') {
                    signatureStr = requestBody;
                }
            }
            var timestamp = new Date().getTime();
            var appNonce = (0, uuid_1.v4)();
            var end = appNonce.length - 1;
            lodash_1.default.merge(options, {
                headers: (_b = {},
                    _b[signField] = client_crypto_1.default.SHA256("".concat(signatureStr).concat(timestamp).concat(appNonce.substring(2, end))),
                    _b[timestampField] = timestamp,
                    _b[appNonceField] = appNonce,
                    _b),
            });
        };
        this.processParamsAfter = function (props) {
            var _a = processParamsAfter(props), params = _a.params, paramsInOptions = _a.paramsInOptions;
            var method = props.method, options = props.options, processData = props.processData;
            signData({ params: params, paramsInOptions: paramsInOptions, method: method, options: options, processData: processData });
            return { params: params, paramsInOptions: paramsInOptions };
        };
    };
}
exports.default = signatureExtend;
