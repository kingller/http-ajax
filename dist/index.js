'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjaxClass = void 0;
var base_1 = __importDefault(require("./base"));
var crypto_1 = __importDefault(require("./extend/crypto"));
var signature_1 = __importDefault(require("./extend/signature"));
// function onForbidden(): void {
//     window.$alert(i18next.t('confirm.forbidden'));
// }
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.$feedback = window.$feedback || function () { };
var AjaxClass = /** @class */ (function (_super) {
    __extends(AjaxClass, _super);
    function AjaxClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Ajax = function () {
            return new AjaxClass();
        };
        _this.clone = function () {
            var cloneAjax = new AjaxClass();
            var cloneFields = [
                'prefix',
                '$loading',
                'beforeSend',
                'processData',
                'processResponse',
                'onSuccess',
                'onError',
                'onSessionExpired',
                '_config',
            ];
            for (var _i = 0, cloneFields_1 = cloneFields; _i < cloneFields_1.length; _i++) {
                var field = cloneFields_1[_i];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (this[field]) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    cloneAjax[field] = this[field];
                }
            }
            return cloneAjax;
        };
        _this.cryptoExtend = crypto_1.default;
        _this.signatureExtend = signature_1.default;
        return _this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxClass.prototype.onSuccess = function (xhr, _a) {
        var response = _a.response, options = _a.options, resolve = _a.resolve, reject = _a.reject;
        if (response.result) {
            if (response.confirmMsg) {
                delete response.result;
                resolve(response);
            }
            else {
                if (response.warnMsg) {
                    window.$feedback(response.warnMsg, 'warning');
                }
                resolve(response.data);
            }
        }
        else if (response.result === false) {
            reject(response);
            if (options && options.autoPopupErrorMsg === false) {
                return;
            }
            window.$feedback(response.errorMsg);
        }
        else {
            resolve(response);
        }
    };
    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AjaxClass.prototype.onError = function (xhr, _opts) {
        _opts.reject(xhr);
    };
    AjaxClass.prototype.extend = function (pluginFunc) {
        pluginFunc.apply(this);
    };
    return AjaxClass;
}(base_1.default));
exports.AjaxClass = AjaxClass;
var ajax = new AjaxClass();
ajax.AjaxClass = AjaxClass;
exports.default = ajax;
