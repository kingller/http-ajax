import { IResult, IOptions } from '../interface';
import { parseHeaders } from './parse-headers';

export function transformResponse<T>({
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
    if (options && options.transformResponse) {
        const responseHeaders = xhr ? parseHeaders(xhr.getAllResponseHeaders()) : undefined;
        if (response && typeof response === 'object' && typeof response[statusField] !== 'undefined') {
            (response as IResult).data = options.transformResponse((response as IResult).data, responseHeaders);
        } else {
            response = options.transformResponse(response, responseHeaders);
        }
    }
    return response;
}
