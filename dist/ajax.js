"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAjax = void 0;
var base_1 = __importDefault(require("./base"));
var response_data_1 = require("./utils/response-data");
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.$feedback = window.$feedback || function () { };
var HttpAjax = /** @class */ (function (_super) {
    __extends(HttpAjax, _super);
    function HttpAjax() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Ajax = function () {
            return new HttpAjax();
        };
        _this.clone = function () {
            var cloneAjax = new HttpAjax();
            var cloneFields = [
                'prefix',
                '$loading',
                'request',
                'beforeSend',
                'processData',
                'processParams',
                'processParamsAfter',
                'processResponse',
                'processErrorResponse',
                'responseEnd',
                'onSuccess',
                'onError',
                'onSessionExpired',
                'onCryptoExpired',
                'catchError',
                'clear',
                '_config',
                '_loadingExtendAdded',
                '_cryptoExtendAdded',
                '_snExtendAdded',
            ];
            for (var _i = 0, cloneFields_1 = cloneFields; _i < cloneFields_1.length; _i++) {
                var field = cloneFields_1[_i];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (typeof this[field] !== 'undefined') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    cloneAjax[field] = this[field];
                }
            }
            return cloneAjax;
        };
        return _this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    HttpAjax.prototype.onSuccess = function (xhr, _a) {
        var response = _a.response, options = _a.options, resolve = _a.resolve, reject = _a.reject;
        var statusField = this._config.statusField;
        if (response && typeof response === 'object' && typeof response[statusField] !== 'undefined') {
            if (response[statusField]) {
                if (response.confirmMsg) {
                    delete response[statusField];
                    resolve(response);
                }
                else {
                    if (response.warnMsg) {
                        window.$feedback(response.warnMsg, 'warning');
                    }
                    resolve(response.data);
                }
            }
            else {
                reject(response);
                if (options && options.autoPopupErrorMsg === false) {
                    return;
                }
                window.$feedback(response.errorMsg);
            }
        }
        else {
            resolve((0, response_data_1.getResponseData)({ response: response, statusField: statusField }));
        }
    };
    /** 添加默认AJAX错误处理程序 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    HttpAjax.prototype.onError = function (xhr, _opts) {
        var error = {
            errorCode: xhr.status,
            errorMsg: xhr.statusText,
        };
        this.catchError({
            errorCode: error.errorCode,
            errorMsg: error.errorMsg,
            type: 'log',
            method: _opts.method,
            url: _opts.url,
            params: _opts.params,
            options: _opts.options,
            xCorrelationID: _opts.xCorrelationID,
            xhr: xhr,
        });
        if (xhr.status === 401 || xhr.status === 406) {
            this.onSessionExpired(error, _opts);
        }
        else {
            _opts.reject(xhr);
        }
    };
    /** 添加扩展 */
    HttpAjax.prototype.extend = function (pluginFunc) {
        pluginFunc.apply(this);
    };
    return HttpAjax;
}(base_1.default));
exports.HttpAjax = HttpAjax;
var ajax = new HttpAjax();
ajax.HttpAjax = HttpAjax;
exports.default = ajax;
