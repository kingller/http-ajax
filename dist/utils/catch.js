"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAjaxError = void 0;
function catchAjaxError(_a) {
    var e = _a.e, method = _a.method, url = _a.url, params = _a.params, callback = _a.callback, type = _a.type;
    var errorMsg = e.stack || e.message;
    var remark = "ajax: " + method + " " + url + " params: " + JSON.stringify(params);
    console && console.error(errorMsg + " " + remark);
    callback({
        errorMsg: errorMsg,
        remark: remark,
        type: type,
    });
}
exports.catchAjaxError = catchAjaxError;
