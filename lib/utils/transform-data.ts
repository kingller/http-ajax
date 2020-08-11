import { IResult, IOptions } from '../interface';
import { parseHeaders } from './parse-headers';

export function transformData<T>({
    response,
    options,
    xhr,
    statusField,
}: {
    response: T;
    options: IOptions;
    xhr: XMLHttpRequest;
    statusField: string;
}): T {
    if (options && options.transformData) {
        const responseHeaders = xhr ? parseHeaders(xhr.getAllResponseHeaders()) : undefined;
        if (response && typeof response === 'object' && typeof response[statusField] !== 'undefined') {
            (response as IResult).data = options.transformData((response as IResult).data, responseHeaders);
        } else {
            response = options.transformData(response, responseHeaders);
        }
    }
    return response;
}
