import { IParams } from '../interface';
export declare function addPrefixToUrl(url: string, globalPrefix: string, optionsPrefix: string | undefined): string;
export declare function processParamsInUrl(url: string, params: IParams | undefined): {
    url: string;
    params: IParams | undefined;
};
