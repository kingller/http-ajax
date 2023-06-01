export declare function isOpenApi(response: any): boolean;
export declare function getResponseData<T = any>({ response, statusField }: {
    response: any;
    statusField: string;
}): any;
export declare function setResponseData({ response, data, statusField }: {
    response: any;
    data: any;
    statusField: string;
}): any;
