import { IOptions } from '../interface';
export declare function transformData<T>({ response, options, xhr, statusField, }: {
    response: T;
    options: IOptions;
    xhr: XMLHttpRequest;
    statusField: string;
}): T;
