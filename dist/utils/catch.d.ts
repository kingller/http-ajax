import * as IAjax from '../interface';
export declare function catchAjaxError({ e, method, url, params, callback, type, }: {
    e: Error;
    method: IAjax.IMethod;
    url: string;
    params?: IAjax.IParams;
    callback: IAjax.ICatchError;
    type?: 'uncaught' | 'log';
}): void;
