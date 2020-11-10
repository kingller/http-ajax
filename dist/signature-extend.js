"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var client_crypto_1 = __importDefault(require("client-crypto"));
var v4_1 = __importDefault(require("uuid/v4"));
var form_1 = require("./utils/form");
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
        var processData = this.processData;
        // 参数混淆，增加签名方式代码被分析出难度
        // app-nonce 只使用一次标识码
        var appNonceField = ['app', ['non', 'ce'].join('')].join('-');
        // timestamp 时间
        var timestampField = ['time', 'sta', 'mp'].join('');
        // sign 签名
        var signField = ['si', 'gn'].join('');
        // 校验该扩展是否已添加过
        if (this._signatureExtendAdded) {
            console && console.error('`signatureExtend` can only be added to ajax once!');
        }
        // 添加标志符用来校验该扩展是否已添加
        this._signatureExtendAdded = true;
        var signData = function (_a) {
            var _b;
            var params = _a.params, method = _a.method, options = _a.options;
            var signatureStr = form_1.isFormData(params)
                ? ''
                : _this.stringifyParams(params, method, { cache: true, encodeValue: false });
            var timestamp = new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000;
            var appNonce = v4_1.default();
            lodash_1.default.merge(options, {
                headers: (_b = {},
                    _b[signField] = client_crypto_1.default.SHA256("" + signatureStr + timestamp + appNonce.substring(2, appNonce.length - 1)),
                    _b[timestampField] = timestamp,
                    _b[appNonceField] = appNonce,
                    _b),
            });
        };
        this.processData = function (params, props) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params = processData(params, props);
            var method = props.method, options = props.options;
            signData({ params: params, method: method, options: options });
            return params;
        };
    };
}
exports.default = signatureExtend;
