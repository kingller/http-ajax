import * as IAjax from '../interface';

export function catchAjaxError({
    e,
    method,
    url,
    params,
    callback,
    type,
    options,
    xCorrelationID,
    xhr,
}: {
    e: Error;
    method: IAjax.IMethod;
    url: string;
    params?: IAjax.IParams;
    callback: IAjax.ICatchError;
    type?: 'uncaught' | 'log';
    options?: IAjax.IOptions;
    xCorrelationID?: string;
    xhr?: XMLHttpRequest;
}): void {
    const errorMsg = e ? e.stack || e.message : '';
    callback({
        errorMsg,
        type,
        method,
        url,
        params,
        options,
        xCorrelationID,
        xhr,
    });
}
