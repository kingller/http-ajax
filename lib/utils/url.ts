import { IParams, IOptions } from '../interface';
import { isFormData } from './form';

export function addPrefixToUrl(url: string, globalPrefix: string, optionsPrefix: string | undefined): string {
    if (typeof optionsPrefix === 'string') {
        return `${optionsPrefix}${url}`;
    }
    if (/^https?:\/\//.test(url)) {
        return url;
    }
    return `${globalPrefix}${url}`;
}

function fillParamsInUrl(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlParams: { [name: string]: any }
): {
    url: string;
} {
    const modules = url.split('/');

    const urlModules = modules.map(function (m) {
        if (m && /^:\w/.test(m)) {
            const paramName = m.match(/^:(.*)$/)[1];
            return urlParams[paramName];
        }
        return m;
    });
    return {
        url: urlModules.join('/'),
    };
}

export function processParamsInUrl(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlParams: { [name: string]: any },
    params: IParams | undefined
): {
    url: string;
} {
    if (url && /(^|\/):\w/.test(url) && urlParams && !isFormData(params)) {
        const matchQueryString = url.match(/(.*?)\?(.*)/);
        let queryStringInUrl = '';
        if (matchQueryString) {
            url = matchQueryString[1];
            queryStringInUrl = matchQueryString[2];
        }
        let { url: filledUrl } = fillParamsInUrl(url, urlParams);
        if (queryStringInUrl) {
            filledUrl = `${filledUrl}?${queryStringInUrl}`;
        }
        return {
            url: filledUrl,
        };
    }

    return {
        url,
    };
}
