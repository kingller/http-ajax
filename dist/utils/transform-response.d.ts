import { IOptions } from '../interface';
export declare function transformResponse<T>({ response, options, xhr, statusField, }: {
    response: T;
    options: IOptions;
    xhr: XMLHttpRequest;
    statusField: string;
}): T;
