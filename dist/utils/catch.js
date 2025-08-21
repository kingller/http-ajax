"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAjaxError = catchAjaxError;
function catchAjaxError(_a) {
    var e = _a.e, method = _a.method, url = _a.url, params = _a.params, callback = _a.callback, type = _a.type, options = _a.options, xCorrelationID = _a.xCorrelationID, xhr = _a.xhr;
    var errorMsg = e ? e.stack || e.message : '';
    callback({
        errorMsg: errorMsg,
        type: type,
        method: method,
        url: url,
        params: params,
        options: options,
        xCorrelationID: xCorrelationID,
        xhr: xhr,
    });
}
