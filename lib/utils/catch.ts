import * as IAjax from '../interface';

export function catchAjaxError({
    e,
    method,
    url,
    params,
    callback,
    type,
}: {
    e: Error;
    method: IAjax.IMethod;
    url: string;
    params?: IAjax.IParams;
    callback: IAjax.ICatchError;
    type?: 'uncaught' | 'log';
}): void {
    const errorMsg = e.stack || e.message;
    const remark = `ajax: ${method} ${url} params: ${JSON.stringify(params)}`;
    console && console.error(`${errorMsg} ${remark}`);
    callback({
        errorMsg,
        remark,
        type,
    });
}
