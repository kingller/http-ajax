import { IParams } from '../interface';
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
    params: { [name: string]: any }
    /* eslint-disable @typescript-eslint/indent */
): {
    url: string;
    params: IParams | undefined;
} {
    /* eslint-enable @typescript-eslint/indent */
    params = { ...params };
    const modules = url.split('/');
    const urlModules = modules.map(function (m) {
        if (m && /^:\w/.test(m)) {
            const paramName = m.match(/^:(.*)$/)[1];
            const value = encodeURIComponent(params[paramName]);
            delete params[paramName];
            return value;
        }
        return m;
    });
    return {
        url: urlModules.join('/'),
        params,
    };
}

export function processParamsInUrl(
    url: string,
    params: IParams | undefined
    /* eslint-disable @typescript-eslint/indent */
): {
    url: string;
    params: IParams | undefined;
} {
    /* eslint-enable @typescript-eslint/indent */
    if (url && /(^|\/):\w/.test(url) && params && typeof params === 'object' && !isFormData(params)) {
        const matchQueryString = url.match(/(.*?)\?(.*)/);
        let queryStringInUrl = '';
        if (matchQueryString) {
            url = matchQueryString[1];
            queryStringInUrl = matchQueryString[2];
        }
        let { url: filledUrl, params: restParams } = fillParamsInUrl(url, params);
        if (queryStringInUrl) {
            filledUrl = `${filledUrl}?${queryStringInUrl}`;
        }
        return {
            url: filledUrl,
            params: restParams,
        };
    }

    return {
        url,
        params,
    };
}
