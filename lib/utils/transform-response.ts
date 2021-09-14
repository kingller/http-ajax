import { IResult, IOptions } from '../interface';
import { parseHeaders } from './parse-headers';
import { getResponseData, setResponseData } from './response-data';

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
        let data = getResponseData({ response, statusField });
        data = options.transformResponse(data, responseHeaders);
        response = setResponseData({ response, data, statusField });
    }
    return response;
}
