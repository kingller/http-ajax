import { IParams, IOptions } from '../interface';
export declare function addPrefixToUrl(url: string, globalPrefix: string, optionsPrefix: string | undefined): string;
export declare function processParamsInUrl(url: string, urlParams: {
    [name: string]: any;
}): {
    url: string;
};
export declare function needFormatData({ params, processData, }: {
    params: {
        [name: string]: any;
    } | string;
    processData?: boolean;
}): boolean;
export declare function splitUrlParams({ url, params, paramsInOptions, processData, }: {
    url: string;
    params: IParams;
    paramsInOptions: IOptions['params'];
    processData?: boolean;
}): {
    urlParams: {
        [name: string]: any;
    };
    params: IParams;
    paramsInOptions: IOptions['params'];
};
