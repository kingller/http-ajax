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

function getParamsInUrl(url: string): string[] {
    const modules = url.split('/');

    const params: string[] = [];
    modules.forEach(function (m) {
        if (m && /^:\w/.test(m)) {
            const paramName = m.match(/^:(.*)$/)[1];
            params.push(paramName);
        }
    });
    return params;
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
            return encodeURIComponent(urlParams[paramName]);
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
    urlParams: { [name: string]: any }
): {
    url: string;
} {
    if (url && urlParams) {
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

export function needFormatData({
    params,
    processData,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { [name: string]: any } | string;
    processData?: boolean;
}) {
    return processData !== false && !isFormData(params);
}

export function splitUrlParams({
    url,
    params,
    paramsInOptions,
    processData,
}: {
    url: string;
    params: IParams;
    paramsInOptions: IOptions['params'];
    processData?: boolean;
}): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlParams: { [name: string]: any };
    params: IParams;
    paramsInOptions: IOptions['params'];
} {
    const urlParamNames = getParamsInUrl(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urlParams: { [name: string]: any } = {};
    if (
        !urlParamNames ||
        !urlParamNames.length ||
        ((!params || typeof params !== 'object') && (!paramsInOptions || typeof paramsInOptions !== 'object'))
    ) {
        return {
            urlParams,
            params,
            paramsInOptions,
        };
    }
    let findInParams = false;
    if (params && typeof params === 'object' && needFormatData({ params, processData })) {
        params = { ...params };
        findInParams = true;
    }
    let findInOptions = false;
    if (paramsInOptions && typeof paramsInOptions === 'object') {
        paramsInOptions = { ...paramsInOptions };
        findInOptions = true;
    }
    for (const paramName of urlParamNames) {
        if (findInOptions) {
            if (paramName in paramsInOptions) {
                urlParams[paramName] = paramsInOptions[paramName];
                delete paramsInOptions[paramName];
                continue;
            }
        }
        if (findInParams) {
            if (paramName in (params as object)) {
                urlParams[paramName] = params[paramName];
                delete params[paramName];
            }
        }
    }

    return {
        urlParams: Object.keys(urlParams).length > 0 ? urlParams : null,
        params,
        paramsInOptions,
    };
}
